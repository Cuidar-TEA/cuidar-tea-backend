import prisma from "../config/prismaClient";
import { Prisma } from "../generated/prisma";

export class AgendamentosRepository {
  public async getMediaDeAvaliacoes(): Promise<number> {
    const result = await prisma.agendamentos.aggregate({
      _avg: {
        nota_atendimento: true,
      },
      where: {
        nota_atendimento: {
          not: null,
        },
      },
    });

    return result._avg.nota_atendimento || 0;
  }

  public async buscarPorId(id: number) {
    return prisma.agendamentos.findUnique({
      where: { id_agendamento: id },
      include: {
        pacientes: { select: { usuarios_id_usuario: true } },
        profissionais: { select: { usuarios_id_usuario: true } },
      },
    });
  }

  public async buscarConflito(idProfissional: number, dataHoraInicio: Date) {
    return prisma.agendamentos.findFirst({
      where: {
        profissionais_id_profissional: idProfissional,
        data_horario_inicio: dataHoraInicio,
        status: "AGENDADO",
      },
    });
  }

  public async buscarMuitosPorProfissionalEData(
    idProfissional: number,
    data: Date
  ) {
    return prisma.agendamentos.findMany({
      where: {
        profissionais_id_profissional: idProfissional,
        data_horario_inicio: {
          gte: new Date(data.setHours(0, 0, 0, 0)),
          lt: new Date(data.setHours(23, 59, 59, 999)),
        },
        status: "AGENDADO",
      },
    });
  }

  public async criar(
    data: Prisma.agendamentosCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.agendamentos.create({
      data,
      include: {
        profissionais: true,
        enderecos: true,
      },
    });
  }

  public async atualizar(id: number, data: Prisma.agendamentosUpdateInput) {
    return prisma.agendamentos.update({
      where: { id_agendamento: id },
      data,
    });
  }

  public async buscarAtivosPorPaciente(idPaciente: number) {
    return prisma.agendamentos.findMany({
      where: {
        pacientes_id_paciente: idPaciente,
        status: "AGENDADO",
      },
      orderBy: {
        data_horario_inicio: "asc",
      },
      include: {
        profissionais: {
          select: {
            nome: true,
            foto_perfil_url: true,
          },
        },
        enderecos: {
          select: {
            logradouro: true,
            numero: true,
            cidade: true,
            estado: true,
            apelido_endereco: true,
          },
        },
      },
    });
  }

  public async buscarPacientesAtivosIds(idProfissional: number) {
    return prisma.agendamentos.findMany({
      where: {
        profissionais_id_profissional: idProfissional,
        status: "AGENDADO",
      },
      select: {
        pacientes_id_paciente: true,
      },
    });
  }

  public async buscarIdsProfissionaisPorNotaMedia(
    nota: number
  ): Promise<number[]> {
    const mediasDeAvaliacao = await (prisma.agendamentos.groupBy as any)({
      by: ["profissionais_id_profissional"],
      _avg: {
        nota_atendimento: true,
      },
      having: {
        nota_atendimento: {
          _avg: {
            gte: nota,
          },
        },
      },
    });

    const idsProfissionais = mediasDeAvaliacao.map(
      (a: { profissionais_id_profissional: number }) =>
        a.profissionais_id_profissional
    );

    return idsProfissionais;
  }

  public async buscarPorIdComPerfis(id: number) {
    return prisma.agendamentos.findUnique({
      where: { id_agendamento: id },
      include: {
        pacientes: { select: { usuarios_id_usuario: true } },
        profissionais: { select: { usuarios_id_usuario: true } },
      },
    });
  }
}
