import prisma from "../config/prismaClient";
import { Prisma } from "../generated/prisma";

export class ProfissionalRepository {
  public async buscarProfissionalPorCpf(cpf: string) {
    return prisma.profissionais.findUnique({ where: { cpf } });
  }

  public async criarNovoProfissional(
    data: Prisma.profissionaisCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.profissionais.create({ data });
  }

  public async buscarProfissionalPorIdUsuario(idUsuario: number) {
    return prisma.profissionais.findFirst({
      where: {
        usuarios_id_usuario: idUsuario,
      },
    });
  }

  public async getQuantidadeDeProfissionais(): Promise<number> {
    return prisma.profissionais.count();
  }

  public async atualizar(id: number, data: Prisma.profissionaisUpdateInput) {
    return prisma.profissionais.update({
      where: { id_profissional: id },
      data,
      include: {
        profissional_tags: {
          include: {
            tags: true,
          },
        },
        profissional_idiomas: {
          include: {
            idiomas: true,
          },
        },
      },
    });
  }

  public async buscarMuitos<T extends Prisma.profissionaisFindManyArgs>(
    args: T
  ): Promise<Prisma.profissionaisGetPayload<T>[]> {
    return prisma.profissionais.findMany(args) as any;
  }

  public async buscarUnico(
    where: Prisma.profissionaisWhereUniqueInput,
    select?: Prisma.profissionaisSelect
  ) {
    return prisma.profissionais.findUnique({ where, select });
  }

  public async buscarProfissionalPorId(id: number) {
    return prisma.profissionais.findUnique({
      where: {
        id_profissional: id,
      },
      include: {
        profissional_tags: {
          include: {
            tags: true,
          },
        },
        profissional_idiomas: {
          include: {
            idiomas: true,
          },
        },
        profissional_especialidades: {
          include: {
            especialidades: true,
          },
        },
        profissional_formacoes: {
          include: {
            formacoes: true,
          },
        },
      },
    });
  }
}
