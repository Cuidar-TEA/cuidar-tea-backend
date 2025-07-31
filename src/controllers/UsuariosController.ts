import { Request, Response } from "express";
import { UsuarioService } from "../services/UsuariosService";
import {
  criarUsuarioDTO,
  criarContaFamiliaDTO,
  criarContaProfissionalDTO,
} from "../DTOs/usuarioDTO";

const usuarioService = new UsuarioService();

export class UsuarioController {
  public async criarContaFamilia(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { email, senha, ...dadosPaciente } = req.body;
      const DTOUsuario: criarUsuarioDTO = { email, senha };
      const DTOPaciente: criarContaFamiliaDTO = dadosPaciente;

      const resultado = await usuarioService.criarContaFamilia(
        DTOUsuario,
        DTOPaciente
      );

      return res.status(201).json(resultado);
    } catch (error: any) {
      if (
        error.message.includes("já está em uso") ||
        error.message.includes("já está cadastrado")
      ) {
        return res.status(409).json({ message: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ message: "Ocorreu um erro interno no servidor." });
    }
  }

  public async criarContaProfissional(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { email, senha, ...dadosProfissional } = req.body;
      const DTOUsuario: criarUsuarioDTO = { email, senha };
      const DTOProfissional: criarContaProfissionalDTO = dadosProfissional;

      const resultado = await usuarioService.criarContaProfissional(
        DTOUsuario,
        DTOProfissional
      );

      return res.status(201).json(resultado);
    } catch (error: any) {
      if (
        error.message.includes("já está em uso") ||
        error.message.includes("já está cadastrado")
      ) {
        return res.status(409).json({ message: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ message: "Ocorreu um erro interno no servidor." });
    }
  }
}
