import prisma from "../config/prismaClient";
import { Prisma } from "../generated/prisma";

export class PacienteRepository {
  public async buscarPacientePorCpf(cpf: string) {
    return prisma.pacientes.findUnique({ where: { cpf } });
  }

  public async criarNovoPaciente(
    data: Prisma.pacientesCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.pacientes.create({ data });
  }

  public async buscarPacientePorId(idUsuario: number) {
    return prisma.pacientes.findFirst({
      where: {
        usuarios_id_usuario: idUsuario,
      },
    });
  }

  public async getQuantidadeDePacientes(): Promise<number> {
    return prisma.pacientes.count();
  }

  public async buscarMuitosPorIds(ids: number[]) {
    return prisma.pacientes.findMany({
      where: {
        id_paciente: {
          in: ids,
        },
      },
    });
  }
}
