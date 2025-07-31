import { PrismaClient } from "../generated/prisma";
import { CriarAgendamentoDTO } from "../validators/agendamentosValidator";
import { AvaliarAgendamentoDTO } from "../validators/agendamentosValidator";

const prisma = new PrismaClient();

export class AgendamentosService {
  public async criarAgendamento(
    idPaciente: number,
    dadosAgendamento: CriarAgendamentoDTO
  ) {
    const dataHoraInicio = dadosAgendamento.data_horario_inicio;
    const conflitoExistente = await prisma.agendamentos.findFirst({
      where: {
        profissionais_id_profissional:
          dadosAgendamento.profissionais_id_profissional,
        data_horario_inicio: dataHoraInicio,
        status: "AGENDADO",
      },
    });
    if (conflitoExistente) {
      throw new Error(
        "Este horário acabou de ser preenchido. Por favor, escolha outro."
      );
    }

    const novoAgendamento = await prisma.agendamentos.create({
      data: {
        pacientes_id_paciente: idPaciente,
        profissionais_id_profissional:
          dadosAgendamento.profissionais_id_profissional,
        enderecos_id_endereco: dadosAgendamento.enderecos_id_endereco,
        data_horario_inicio: dataHoraInicio,
        duracao_consulta_minutos: dadosAgendamento.duracao_consulta_minutos,
        status: "AGENDADO", // Status default de qualquer agendamento criado.
      },
      include: {
        profissionais: true,
        enderecos: true,
      },
    });

    return novoAgendamento;
  }

  public async adicionarAvaliacao(
    idAgendamento: number,
    idPaciente: number,
    dadosAvaliacao: AvaliarAgendamentoDTO
  ) {
    const agendamento = await prisma.agendamentos.findUnique({
      where: { id_agendamento: idAgendamento },
    });
    if (!agendamento) {
      throw new Error("Agendamento não encontrado.");
    }
    if (agendamento.pacientes_id_paciente !== idPaciente) {
      throw new Error(
        "Acesso negado. Você só pode avaliar seus próprios agendamentos."
      );
    }
    if (agendamento.status !== "FINALIZADO") {
      throw new Error(
        "Apenas agendamentos com status 'FINALIZADO' podem ser avaliados."
      );
    }
    if (agendamento.nota_atendimento !== null) {
      throw new Error("Este agendamento já foi avaliado anteriormente.");
    }

    const agendamentoAtualizado = await prisma.agendamentos.update({
      where: {
        id_agendamento: idAgendamento,
      },
      data: {
        nota_atendimento: dadosAvaliacao.nota_atendimento,
        avaliacao: dadosAvaliacao.avaliacao,
      },
    });

    return agendamentoAtualizado;
  }

  public async finalizarAgendamento(
    idAgendamento: number,
    idUsuarioLogado: number
  ) {
    const agendamento = await prisma.agendamentos.findUnique({
      where: { id_agendamento: idAgendamento },
      include: {
        pacientes: { select: { usuarios_id_usuario: true } },
        profissionais: { select: { usuarios_id_usuario: true } },
      },
    });
    if (!agendamento) {
      throw new Error("Agendamento não encontrado.");
    }

    const isPaciente =
      agendamento.pacientes.usuarios_id_usuario === idUsuarioLogado;
    const isProfissional =
      agendamento.profissionais.usuarios_id_usuario === idUsuarioLogado;
    if (!isPaciente && !isProfissional) {
      throw new Error(
        "Acesso negado. Você não tem permissão para modificar este agendamento."
      );
    }

    if (agendamento.status !== "AGENDADO") {
      throw new Error(
        "Apenas agendamentos com status 'AGENDADO' podem ser finalizados."
      );
    }

    const agendamentoFinalizado = await prisma.agendamentos.update({
      where: {
        id_agendamento: idAgendamento,
      },
      data: {
        status: "FINALIZADO",
      },
    });

    return agendamentoFinalizado;
  }

  public async cancelarAgendamento(
    idAgendamento: number,
    idUsuarioLogado: number
  ) {
    const agendamento = await prisma.agendamentos.findUnique({
      where: { id_agendamento: idAgendamento },
      include: {
        pacientes: { select: { usuarios_id_usuario: true } },
        profissionais: { select: { usuarios_id_usuario: true } },
      },
    });
    if (!agendamento) {
      throw new Error("Agendamento não encontrado.");
    }

    const isPaciente =
      agendamento.pacientes.usuarios_id_usuario === idUsuarioLogado;
    const isProfissional =
      agendamento.profissionais.usuarios_id_usuario === idUsuarioLogado;

    if (!isPaciente && !isProfissional) {
      throw new Error(
        "Acesso negado. Você não tem permissão para cancelar este agendamento."
      );
    }
    if (agendamento.status !== "AGENDADO") {
      throw new Error(
        `Não é possível cancelar um agendamento com status '${agendamento.status}'.`
      );
    }

    const agendamentoCancelado = await prisma.agendamentos.update({
      where: {
        id_agendamento: idAgendamento,
      },
      data: {
        status: "CANCELADO",
      },
    });

    return agendamentoCancelado;
  }

  public async listarAgendamentosPorPaciente(idPaciente: number) {
    const agendamentos = await prisma.agendamentos.findMany({
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

    if (!agendamentos) {
      return [];
    }

    return agendamentos;
  }
}
