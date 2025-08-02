import { ProfissionalRepository } from "../repositories/ProfissionaisRepository";
import { PacienteRepository } from "../repositories/PacientesRepository";
import { AgendamentosRepository } from "../repositories/AgendamentosRepository";

export class EstatisticasService {
  private profissionalRepository: ProfissionalRepository;
  private pacienteRepository: PacienteRepository;
  private agendamentosRepository: AgendamentosRepository;

  constructor() {
    this.profissionalRepository = new ProfissionalRepository();
    this.pacienteRepository = new PacienteRepository();
    this.agendamentosRepository = new AgendamentosRepository();
  }

  public async getQuantidadeProfissionais(): Promise<number> {
    return this.profissionalRepository.getQuantidadeDeProfissionais();
  }

  public async getQuantidadePacientes(): Promise<number> {
    return this.pacienteRepository.getQuantidadeDePacientes();
  }

  public async getMediaAvaliacoes(): Promise<number> {
    return this.agendamentosRepository.getMediaDeAvaliacoes();
  }

  public async getEstatisticasHome() {
    const [quantidadeProfissionais, quantidadePacientes, mediaAvaliacoes] =
      await Promise.all([
        this.getQuantidadeProfissionais(),
        this.getQuantidadePacientes(),
        this.getMediaAvaliacoes(),
      ]);

    return {
      quantidadeProfissionais,
      quantidadePacientes,
      mediaAvaliacoes: Number(mediaAvaliacoes.toFixed(1)),
    };
  }
}
