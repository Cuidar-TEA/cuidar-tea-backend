import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();

export class AuthService {
  // Criação do método para login dos usuários.
  public async login(email: string, senha: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
      include: { pacientes: true, profissionais: true },
    });

    let tipoUsuario: string;

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }
    tipoUsuario = usuario.pacientes.length > 0 ? "paciente" : "profissional";

    const senhaCriptografada = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCriptografada) {
      throw new Error("Senha inválida");
    }

    const tokenPayLoad = {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      tipoUsuario,
    };
    const token = generateToken(tokenPayLoad);
    return { tipoUsuario, token };
  }
}
