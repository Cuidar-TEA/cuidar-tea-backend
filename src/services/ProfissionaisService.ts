import { PrismaClient, Prisma } from "../generated/prisma";
import { timeStringToDate } from "../utils/time";
import { v2 as cloudinary } from "cloudinary";
import { HorariosTrabalhoDTO } from "../validators/profissionaisValidator";
import { BuscarProfissionaisDTO } from "../validators/profissionaisValidator";
import { AtualizarPerfilProfissionalDTO } from "../validators/profissionaisValidator";

const prisma = new PrismaClient();

export class ProfissionalService {
  public async atualizarGradeDeTrabalho(
    idProfissional: number,
    gradeDeTrabalho: HorariosTrabalhoDTO[]
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.horarios_trabalho.deleteMany({
        where: {
          profissionais_id_profissional: idProfissional,
        },
      });

      const novosHorariosData = gradeDeTrabalho.map((horario) => ({
        profissionais_id_profissional: idProfissional,
        dia_semana: horario.dia_semana,
        horario_inicio: timeStringToDate(horario.horario_inicio),
        horario_fim: timeStringToDate(horario.horario_fim),
      }));

      await tx.horarios_trabalho.createMany({
        data: novosHorariosData,
      });

      return tx.horarios_trabalho.findMany({
        where: {
          profissionais_id_profissional: idProfissional,
        },
      });
    });
  }

  public async calcularDisponibilidade(idProfissional: number, data: Date) {
    // 1 = Segunda-feira, 2 = Terça-feira, etc...
    const diaDaSemana = data.getDay() === 0 ? 7 : data.getDay();
    const horariosDisponiveis = await prisma.horarios_trabalho.findMany({
      where: {
        profissionais_id_profissional: idProfissional,
        dia_semana: diaDaSemana,
      },
    });

    if (horariosDisponiveis.length === 0) {
      return [];
    }

    const agendamentosDoDia = await prisma.agendamentos.findMany({
      where: {
        profissionais_id_profissional: idProfissional,
        data_horario_inicio: {
          // Pega todos os agendamentos entre o início e o fim do dia solicitado.
          gte: new Date(data.setHours(0, 0, 0, 0)),
          lt: new Date(data.setHours(23, 59, 59, 999)),
        },
        status: "AGENDADO",
      },
    });

    const slotsDisponiveis: string[] = [];
    const duracaoConsulta = 60;
    horariosDisponiveis.forEach((horario) => {
      // Converte os tempos de início e fim do horário para minutos.
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
    const profissional = await prisma.profissionais.findUnique({
      where: { id_profissional: idProfissional },
    });

    if (!profissional) {
      throw new Error("Perfil de profissional não encontrado.");
    }

    const profissionalAtualizado = await prisma.profissionais.update({
      where: {
        id_profissional: idProfissional,
      },
      data: {
        foto_perfil_url: urlDaFoto,
      },
    });

    return profissionalAtualizado;
  }

  public async removerFotoPerfil(idProfissional: number) {
    const profissional = await prisma.profissionais.findUnique({
      where: { id_profissional: idProfissional },
      select: { foto_perfil_url: true },
    });
    if (!profissional) {
      throw new Error("Perfil de profissional não encontrado.");
    }

    if (profissional.foto_perfil_url) {
      try {
        // Extrai o "public_id" da URL. Ex: "cuidar-tea/fotos-perfil/nome_arquivo".
        const publicId = profissional.foto_perfil_url
          .split("/")
          .slice(-3)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Erro ao deletar a imagem antiga do Cloudinary:", error);
        // Mesmo que falhe a deleção no Cloudinary, continuamos para limpar o banco.
      }
    }

    const profissionalSemFoto = await prisma.profissionais.update({
      where: {
        id_profissional: idProfissional,
      },
      data: {
        foto_perfil_url: null,
      },
    });

    return profissionalSemFoto;
  }

  public async atualizarPerfil(
    idProfissional: number,
    dados: AtualizarPerfilProfissionalDTO
  ) {
    const profissional = await prisma.profissionais.findUnique({
      where: { id_profissional: idProfissional },
    });
    if (!profissional) {
      throw new Error("Perfil de profissional não encontrado.");
    }

    const perfilAtualizado = await prisma.profissionais.update({
      where: {
        id_profissional: idProfissional,
      },
      data: dados,
    });

    return perfilAtualizado;
  }

  public async listarPacientesAtivos(idProfissional: number) {
    const agendamentosAtivos = await prisma.agendamentos.findMany({
      where: {
        profissionais_id_profissional: idProfissional,
        status: "AGENDADO",
      },
      select: {
        pacientes_id_paciente: true,
      },
    });

    const idsDosPacientes = [
      ...new Set(agendamentosAtivos.map((ag) => ag.pacientes_id_paciente)),
    ];
    if (idsDosPacientes.length === 0) {
      return [];
    }

    const pacientes = await prisma.pacientes.findMany({
      where: {
        id_paciente: {
          in: idsDosPacientes,
        },
      },
    });

    return pacientes;
  }

  public async buscarProfissionais(filtros: BuscarProfissionaisDTO) {
    const where: Prisma.profissionaisWhereInput = {};

    if (filtros.aceita_convenio !== undefined) {
      where.aceita_convenio = filtros.aceita_convenio;
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

    const profissionais = await prisma.profissionais.findMany({
      where,
      include: {
        enderecos: true,
        profissional_especialidades: {
          include: {
            especialidades: true,
          },
        },
      },
    });

    return profissionais;
  }
}
