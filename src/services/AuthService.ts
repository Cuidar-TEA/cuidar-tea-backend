import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { UsuarioRepository } from "../repositories/UsuariosRepository";

export class AuthService {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  public async login(email: string, senha: string) {
    const usuario = await this.usuarioRepository.buscarContasPorEmail(email);
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }
    const tipoUsuario =
      usuario.pacientes.length > 0 ? "paciente" : "profissional";

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw new Error("Senha inválida");
    }

    const tokenPayload = {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      tipoUsuario,
    };
    const token = generateToken(tokenPayload);

    return { tipoUsuario, token };
  }
}
