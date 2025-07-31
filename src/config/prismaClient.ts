import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient({
  transactionOptions: {
    timeout: 20000,
  },
});

export default prisma;
