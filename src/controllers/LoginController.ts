import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class LoginController {
  public async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          message: "Email e senha são obrigatórios",
        });
      }

      const authService = new AuthService();
      const resultado = await authService.login(email, senha);

      return res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: resultado,
      });
    } catch (error: any) {
      if (
        error.message.includes("Usuário não encontrado") ||
        error.message.includes("Senha inválida")
      ) {
        return res.status(401).json({
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        message: "Erro ao realizar login",
      });
    }
  }
}
