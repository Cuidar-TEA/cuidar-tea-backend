import { Prisma } from "../generated/prisma";

export class TelefoneRepository {
  public async criarNovoTelefone(
    data: Prisma.telefonesCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.telefones.create({ data });
  }
}
