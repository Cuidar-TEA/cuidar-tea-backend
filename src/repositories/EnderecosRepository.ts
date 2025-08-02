import { Prisma } from "../generated/prisma";

export class EnderecoRepository {
  public async criarNovoEndereco(
    data: Prisma.enderecosCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.enderecos.create({ data });
  }
}
