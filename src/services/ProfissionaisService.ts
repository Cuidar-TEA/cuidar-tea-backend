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

export class ProfissionalService {
  private profissionalRepository: ProfissionalRepository;
  private horariosTrabalhoRepository: HorariosTrabalhoRepository;
  private agendamentosRepository: AgendamentosRepository;
  private pacienteRepository: PacienteRepository;

  constructor() {
    this.profissionalRepository = new ProfissionalRepository();
    this.horariosTrabalhoRepository = new HorariosTrabalhoRepository();
    this.agendamentosRepository = new AgendamentosRepository();
    this.pacienteRepository = new PacienteRepository();
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
    const where: Prisma.profissionaisWhereInput = {};

    if (filtros.nota_atendimento) {
      const idsProfissionaisPorAvaliacao =
        await this.agendamentosRepository.buscarIdsProfissionaisPorNotaMedia(
          filtros.nota_atendimento
        );
      if (idsProfissionaisPorAvaliacao.length === 0) {
        return [];
      }
      where.id_profissional = {
        in: idsProfissionaisPorAvaliacao,
      };
    }

    if (filtros.aceita_convenio !== undefined) {
      where.aceita_convenio = filtros.aceita_convenio;
    }
    if (filtros.atende_domicilio !== undefined) {
      where.atende_domicilio = filtros.atende_domicilio ? 1 : 0;
    }
    if (filtros.valor_consulta) {
      where.valor_consulta = {
        lte: filtros.valor_consulta,
      };
    }
    if (filtros.cidade || filtros.estado) {
      where.enderecos = {
        cidade: filtros.cidade ? { equals: filtros.cidade } : undefined,
        estado: filtros.estado ? { equals: filtros.estado } : undefined,
      };
    }
    if (filtros.especialidade) {
      where.profissional_especialidades = {
        some: {
          especialidades: {
            nome_especialidade: {
              equals: filtros.especialidade,
            },
          },
        },
      };
    }
    if (filtros.nome) {
      where.nome = {
        contains: filtros.nome,
      };
    }
    if (filtros.formacao) {
      where.profissional_formacoes = {
        some: {
          formacoes: {
            formacao: {
              equals: filtros.formacao,
            },
          },
        },
      };
    }

    const profissionais = await this.profissionalRepository.buscarMuitos({
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
    });

    return profissionais;
  }
}
