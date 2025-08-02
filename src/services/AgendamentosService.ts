import { CriarAgendamentoDTO } from "../validators/agendamentosValidator";
import { AvaliarAgendamentoDTO } from "../validators/agendamentosValidator";
import { AgendamentosRepository } from "../repositories/AgendamentosRepository";
import { HorariosTrabalhoRepository } from "../repositories/HorariosTrabalhoRepository";
import prisma from "../config/prismaClient";

export class AgendamentosService {
  private agendamentosRepository: AgendamentosRepository;
  private horariosTrabalhoRepository: HorariosTrabalhoRepository;

  constructor() {
    this.agendamentosRepository = new AgendamentosRepository();
    this.horariosTrabalhoRepository = new HorariosTrabalhoRepository();
  }

  public async criarAgendamento(
    idPaciente: number,
    dadosAgendamento: CriarAgendamentoDTO
  ) {
    const dataHoraInicio = new Date(dadosAgendamento.data_horario_inicio);
    if (isNaN(dataHoraInicio.getTime())) {
      throw new Error("Data inválida fornecida para o agendamento.");
    }

    const diaDaSemana =
      dataHoraInicio.getUTCDay() === 0 ? 7 : dataHoraInicio.getUTCDay();
    const horaSolicitada =
      dataHoraInicio.getUTCHours() * 60 + dataHoraInicio.getUTCMinutes();

    const regrasDeTrabalho =
      await this.horariosTrabalhoRepository.buscarPorProfissionalEDia(
        dadosAgendamento.profissionais_id_profissional,
        diaDaSemana
      );

    const horarioValido = regrasDeTrabalho.some((regra) => {
      const inicioMinutos =
        regra.horario_inicio.getUTCHours() * 60 +
        regra.horario_inicio.getUTCMinutes();
      const fimMinutos =
        regra.horario_fim.getUTCHours() * 60 +
        regra.horario_fim.getUTCMinutes();
      return horaSolicitada >= inicioMinutos && horaSolicitada < fimMinutos;
    });
    if (!horarioValido) {
      throw new Error(
        "O profissional não atende no dia ou horário solicitado."
      );
    }

    const conflitoExistente = await this.agendamentosRepository.buscarConflito(
      dadosAgendamento.profissionais_id_profissional,
      dataHoraInicio
    );
    if (conflitoExistente) {
      throw new Error(
        "Este horário acabou de ser preenchido. Por favor, escolha outro."
      );
    }

    return prisma.$transaction(async (tx) => {
      const novoAgendamento = await this.agendamentosRepository.criar(
        {
          pacientes: { connect: { id_paciente: idPaciente } },
          profissionais: {
            connect: {
              id_profissional: dadosAgendamento.profissionais_id_profissional,
            },
          },
          enderecos: {
            connect: { id_endereco: dadosAgendamento.enderecos_id_endereco },
          },
          data_horario_inicio: dataHoraInicio,
          duracao_consulta_minutos: dadosAgendamento.duracao_consulta_minutos,
          status: "AGENDADO",
        },
        tx
      );
      return novoAgendamento;
    });
  }

  public async adicionarAvaliacao(
    idAgendamento: number,
    idPaciente: number,
    dadosAvaliacao: AvaliarAgendamentoDTO
  ) {
    const agendamento = await this.agendamentosRepository.buscarPorId(
      idAgendamento
    );
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

    return this.agendamentosRepository.atualizar(idAgendamento, {
      nota_atendimento: dadosAvaliacao.nota_atendimento,
      avaliacao: dadosAvaliacao.avaliacao,
    });
  }

  public async finalizarAgendamento(
    idAgendamento: number,
    idUsuarioLogado: number
  ) {
    const agendamento = await this.agendamentosRepository.buscarPorIdComPerfis(
      idAgendamento
    );
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

    return this.agendamentosRepository.atualizar(idAgendamento, {
      status: "FINALIZADO",
    });
  }

  public async cancelarAgendamento(
    idAgendamento: number,
    idUsuarioLogado: number
  ) {
    const agendamento = await this.agendamentosRepository.buscarPorIdComPerfis(
      idAgendamento
    );
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

    return this.agendamentosRepository.atualizar(idAgendamento, {
      status: "CANCELADO",
    });
  }

  public async listarAgendamentosPorPaciente(idPaciente: number) {
    const agendamentos =
      await this.agendamentosRepository.buscarAtivosPorPaciente(idPaciente);
    if (!agendamentos) {
      return [];
    }

    return agendamentos;
  }
}
