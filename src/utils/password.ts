import bcrypt from "bcrypt";

const SALT_ROUNDS = 8;

export default async function hashPassword(senha: string): Promise<string> {
  const hash = await bcrypt.hash(senha, SALT_ROUNDS);
  return hash;
}
