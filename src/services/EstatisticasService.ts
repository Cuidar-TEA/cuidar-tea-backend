import prisma from "../config/prismaClient";

export class EstatisticasService {
  public async getQuantidadeProfissionais(): Promise<number> {
    return prisma.profissionais.count();
  }

  public async getQuantidadePacientes(): Promise<number> {
    return prisma.pacientes.count();
  }

  public async getMediaAvaliacoes(): Promise<number> {
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
