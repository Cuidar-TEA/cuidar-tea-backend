import prisma from "../config/prismaClient";
import { Prisma } from "../generated/prisma";
import { criarUsuarioDTO } from "../DTOs/usuarioDTO";

export class UsuarioRepository {
  public async buscarUsuarioPorEmail(email: string) {
    return prisma.usuarios.findUnique({ where: { email } });
  }

  public async criarNovoUsuario(
    data: criarUsuarioDTO,
    tx: Prisma.TransactionClient
  ) {
    return tx.usuarios.create({
      data: {
        email: data.email,
        senha: data.senha,
      },
    });
  }

  public async buscarContasPorEmail(email: string) {
    return prisma.usuarios.findUnique({
      where: { email },
      include: {
        pacientes: true,
        profissionais: true,
      },
    });
  }
}
