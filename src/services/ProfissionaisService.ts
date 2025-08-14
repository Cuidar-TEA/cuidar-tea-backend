import { Prisma } from "../generated/prisma";
import prisma from "../config/prismaClient";
import { timeStringToDate } from "../utils/time";
import { v2 as cloudinary } from "cloudinary";
import {
  HorariosTrabalhoDTO,
  BuscarProfissionaisDTO,
  AtualizarPerfilProfissionalDTO,
} from "../validators/profissionaisValidator";
import { ProfissionalRepository } from "../repositories/ProfissionaisRepository";
import { HorariosTrabalhoRepository } from "../repositories/HorariosTrabalhoRepository";
import { AgendamentosRepository } from "../repositories/AgendamentosRepository";
import { PacienteRepository } from "../repositories/PacientesRepository";
import { EstatisticasService } from "./EstatisticasService";
import { ProfissionalDestaque } from "../DTOs/profissionalDTO";

export class ProfissionalService {
  private profissionalRepository: ProfissionalRepository;
  private horariosTrabalhoRepository: HorariosTrabalhoRepository;
  private agendamentosRepository: AgendamentosRepository;
  private pacienteRepository: PacienteRepository;
  private estatisticasService: EstatisticasService;

  constructor() {
    this.profissionalRepository = new ProfissionalRepository();
    this.horariosTrabalhoRepository = new HorariosTrabalhoRepository();
    this.agendamentosRepository = new AgendamentosRepository();
    this.pacienteRepository = new PacienteRepository();
    this.estatisticasService = new EstatisticasService();
  }

  public async atualizarGradeDeTrabalho(
    idProfissional: number,
    gradeDeTrabalho: HorariosTrabalhoDTO[]
  ) {
    return prisma.$transaction(async (tx) => {
      await this.horariosTrabalhoRepository.deletarMuitos(
        { profissionais_id_profissional: idProfissional },
        tx
      );

      const novosHorariosData = gradeDeTrabalho.map((horario) => ({
        profissionais_id_profissional: idProfissional,
        dia_semana: horario.dia_semana,
        horario_inicio: timeStringToDate(horario.horario_inicio),
        horario_fim: timeStringToDate(horario.horario_fim),
      }));
      await this.horariosTrabalhoRepository.criarMuitos(novosHorariosData, tx);

      return this.horariosTrabalhoRepository.buscarMuitos({
        profissionais_id_profissional: idProfissional,
      });
    });
  }

  public async calcularDisponibilidade(idProfissional: number, data: Date) {
    const diaDaSemana = data.getDay() === 0 ? 7 : data.getDay();
    const horariosDisponiveis =
      await this.horariosTrabalhoRepository.buscarMuitos({
        profissionais_id_profissional: idProfissional,
        dia_semana: diaDaSemana,
      });
    if (horariosDisponiveis.length === 0) return [];

    const agendamentosDoDia =
      await this.agendamentosRepository.buscarMuitosPorProfissionalEData(
        idProfissional,
        data
      );

    const slotsDisponiveis: string[] = [];
    const duracaoConsulta = 60;
    horariosDisponiveis.forEach((horario) => {
      const inicioMinutos =
        horario.horario_inicio.getUTCHours() * 60 +
        horario.horario_inicio.getUTCMinutes();
      const fimMinutos =
        horario.horario_fim.getUTCHours() * 60 +
        horario.horario_fim.getUTCMinutes();

      for (
        let slot = inicioMinutos;
        slot < fimMinutos;
        slot += duracaoConsulta
      ) {
        const hora = Math.floor(slot / 60)
          .toString()
          .padStart(2, "0");
        const minuto = (slot % 60).toString().padStart(2, "0");
        const horarioSlot = `${hora}:${minuto}`;

        const estaOcupado = agendamentosDoDia.some((agendamento) => {
          const horaAgendamento = agendamento.data_horario_inicio
            .getUTCHours()
            .toString()
            .padStart(2, "0");
          const minutoAgendamento = agendamento.data_horario_inicio
            .getUTCMinutes()
            .toString()
            .padStart(2, "0");
          return `${horaAgendamento}:${minutoAgendamento}` === horarioSlot;
        });
        if (!estaOcupado) {
          slotsDisponiveis.push(horarioSlot);
        }
      }
    });

    return slotsDisponiveis;
  }

  public async atualizarFotoPerfil(idProfissional: number, urlDaFoto: string) {
    const profissional = await this.profissionalRepository.buscarUnico({
      id_profissional: idProfissional,
    });
    if (!profissional)
      throw new Error("Perfil de profissional não encontrado.");
    return this.profissionalRepository.atualizar(idProfissional, {
      foto_perfil_url: urlDaFoto,
    });
  }

  public async removerFotoPerfil(idProfissional: number) {
    const profissional = await this.profissionalRepository.buscarUnico(
      { id_profissional: idProfissional },
      { foto_perfil_url: true }
    );
    if (!profissional)
      throw new Error("Perfil de profissional não encontrado.");

    if (profissional.foto_perfil_url) {
      try {
        const publicId = profissional.foto_perfil_url
          .split("/")
          .slice(-3)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Erro ao deletar a imagem antiga do Cloudinary:", error);
      }
    }

    return this.profissionalRepository.atualizar(idProfissional, {
      foto_perfil_url: null,
    });
  }

  public async atualizarPerfil(
    idProfissional: number,
    dados: AtualizarPerfilProfissionalDTO
  ) {
    const profissional = await this.profissionalRepository.buscarUnico({
      id_profissional: idProfissional,
    });
    if (!profissional) {
      throw new Error("Perfil de profissional não encontrado.");
    }

    const dadosParaAtualizar: Prisma.profissionaisUpdateInput = {
      descricao: dados.descricao,
      valor_consulta: dados.valor_consulta,
      aceita_convenio: dados.aceita_convenio,
      atende_domicilio:
        dados.atende_domicilio !== undefined
          ? dados.atende_domicilio
            ? 1
            : 0
          : undefined,
    };

    if (dados.tags) {
      dadosParaAtualizar.profissional_tags = {
        deleteMany: {},
        create: dados.tags.map((nomeTag) => ({
          tags: {
            connectOrCreate: {
              where: { nome_tag: nomeTag },
              create: { nome_tag: nomeTag },
            },
          },
        })),
      };
    }

    if (dados.idiomas) {
      dadosParaAtualizar.profissional_idiomas = {
        deleteMany: {},
        create: dados.idiomas.map((nomeIdioma) => ({
          idiomas: {
            connectOrCreate: {
              where: { idioma: nomeIdioma },
              create: { idioma: nomeIdioma },
            },
          },
        })),
      };
    }

    return this.profissionalRepository.atualizar(
      idProfissional,
      dadosParaAtualizar
    );
  }

  public async listarPacientesAtivos(idProfissional: number) {
    const agendamentosAtivos =
      await this.agendamentosRepository.buscarPacientesAtivosIds(
        idProfissional
      );
    const idsDosPacientes = [
      ...new Set(agendamentosAtivos.map((ag) => ag.pacientes_id_paciente)),
    ];
    if (idsDosPacientes.length === 0) return [];
    return this.pacienteRepository.buscarMuitosPorIds(idsDosPacientes);
  }

  public async buscarProfissionais(filtros: BuscarProfissionaisDTO) {
    const { page, limit, ...outrosFiltros } = filtros;
    const where: Prisma.profissionaisWhereInput = {};

    if (outrosFiltros.nota_atendimento) {
      const idsProfissionaisPorAvaliacao =
        await this.agendamentosRepository.buscarIdsProfissionaisPorNotaMedia(
          outrosFiltros.nota_atendimento
        );
      if (idsProfissionaisPorAvaliacao.length === 0) {
        return { profissionais: [], total: 0, page, limit };
      }
      where.id_profissional = {
        in: idsProfissionaisPorAvaliacao,
      };
    }

    if (outrosFiltros.aceita_convenio !== undefined) {
      where.aceita_convenio = outrosFiltros.aceita_convenio;
    }
    if (outrosFiltros.atende_domicilio !== undefined) {
      where.atende_domicilio = outrosFiltros.atende_domicilio ? 1 : 0;
    }
    if (outrosFiltros.valor_consulta) {
      where.valor_consulta = {
        lte: outrosFiltros.valor_consulta,
      };
    }
    if (outrosFiltros.cidade || outrosFiltros.estado) {
      where.enderecos = {
        cidade: outrosFiltros.cidade
          ? { equals: outrosFiltros.cidade }
          : undefined,
        estado: outrosFiltros.estado
          ? { equals: outrosFiltros.estado }
          : undefined,
      };
    }
    if (outrosFiltros.especialidade) {
      where.profissional_especialidades = {
        some: {
          especialidades: {
            nome_especialidade: {
              equals: outrosFiltros.especialidade,
            },
          },
        },
      };
    }
    if (outrosFiltros.nome) {
      where.nome = {
        contains: outrosFiltros.nome,
      };
    }
    if (outrosFiltros.formacao) {
      where.profissional_formacoes = {
        some: {
          formacoes: {
            formacao: {
              equals: outrosFiltros.formacao,
            },
          },
        },
      };
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [profissionais, total] = await prisma.$transaction([
      prisma.profissionais.findMany({
        where,
        include: {
          enderecos: true,
          profissional_especialidades: {
            include: {
              especialidades: true,
            },
          },
          agendamentos: {
            where: {
              nota_atendimento: {
                not: null,
              },
            },
            select: {
              nota_atendimento: true,
            },
          },
        },
        skip,
        take,
      }),
      prisma.profissionais.count({ where }),
    ]);

    return {
      profissionais,
      total,
      page,
      limit,
    };
  }

  private async _encontrarProximaDisponibilidade(
    idProfissional: number
  ): Promise<string> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const slots = await this.calcularDisponibilidade(idProfissional, hoje);

    if (slots.length > 0) {
      return `Hoje às ${slots[slots.length - 1]}`;
    }

    return "Indisponível";
  }

  public async listarDestaques() {
    const mediaGeral = await this.estatisticasService.getMediaAvaliacoes();
    const idsProfissionaisAcimaDaMedia =
      await this.agendamentosRepository.buscarIdsProfissionaisPorNotaMedia(
        mediaGeral
      );
    if (idsProfissionaisAcimaDaMedia.length === 0) {
      return [];
    }

    const idsDestaque = idsProfissionaisAcimaDaMedia.slice(0, 5);
    const profissionais: ProfissionalDestaque[] =
      await this.profissionalRepository.buscarMuitos({
        where: {
          id_profissional: {
            in: idsDestaque,
          },
        },
        include: {
          enderecos: {
            select: {
              cidade: true,
              estado: true,
            },
          },
          profissional_formacoes: {
            include: {
              formacoes: true,
            },
          },
          agendamentos: {
            where: {
              nota_atendimento: {
                not: null,
              },
            },
            select: {
              nota_atendimento: true,
            },
          },
        },
      });

    const profissionaisComMedia = await Promise.all(
      profissionais.map(async (p) => {
        const notas = p.agendamentos
          .map((a) => a.nota_atendimento)
          .filter((n): n is number => n !== null);

        const mediaIndividual =
          notas.length > 0
            ? parseFloat(
                (
                  notas.reduce((a: number, b: number) => a + b, 0) /
                  notas.length
                ).toFixed(1)
              )
            : 0;

        const proximaDisponibilidade =
          await this._encontrarProximaDisponibilidade(p.id_profissional);

        return {
          id_profissional: p.id_profissional,
          nome: p.nome,
          foto_perfil_url: p.foto_perfil_url,
          formacao:
            p.profissional_formacoes[0]?.formacoes.formacao || "Não informada",
          cidade: p.enderecos?.cidade,
          estado: p.enderecos?.estado,
          valor_consulta: p.valor_consulta,
          avaliacao_media: mediaIndividual,
          total_avaliacoes: notas.length,
          proxima_disponibilidade: proximaDisponibilidade,
        };
      })
    );

    return profissionaisComMedia.sort(
      (a, b) => b.avaliacao_media - a.avaliacao_media
    );
  }

  public async buscarPorId(id: number) {
    return this.profissionalRepository.buscarProfissionalPorId(id);
  }
}
