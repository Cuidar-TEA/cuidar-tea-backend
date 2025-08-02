import { Prisma } from "../generated/prisma";
import prisma from "../config/prismaClient";

export class HorariosTrabalhoRepository {
  public async deletarMuitos(
    where: Prisma.horarios_trabalhoWhereInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.horarios_trabalho.deleteMany({ where });
  }

  public async criarMuitos(
    data: Prisma.horarios_trabalhoCreateManyInput[],
    tx: Prisma.TransactionClient
  ) {
    return tx.horarios_trabalho.createMany({ data });
  }

  public async buscarMuitos(where: Prisma.horarios_trabalhoWhereInput) {
    return prisma.horarios_trabalho.findMany({ where });
  }

  public async buscarPorProfissionalEDia(
    idProfissional: number,
    diaDaSemana: number
  ) {
    return prisma.horarios_trabalho.findMany({
      where: {
        profissionais_id_profissional: idProfissional,
        dia_semana: diaDaSemana,
      },
    });
  }
}
