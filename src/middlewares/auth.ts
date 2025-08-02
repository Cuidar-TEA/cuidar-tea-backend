import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ProfissionalRepository } from "../repositories/ProfissionaisRepository";
import { PacienteRepository } from "../repositories/PacientesRepository";

const profissionalRepository = new ProfissionalRepository();
const pacienteRepository = new PacienteRepository();

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id_usuario: number;
        id_profissional?: number;
        id_paciente?: number;
      };
    }
  }
}

interface JwtPayloadWithId {
  id_usuario: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token de autenticação não fornecido ou mal formatado.",
    });
  }

  const token = authHeader.split(" ")[1];
  const decodedPayload = verifyToken(token);
  if (
    !decodedPayload ||
    typeof decodedPayload !== "object" ||
    !("id_usuario" in decodedPayload)
  ) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
  const payload = decodedPayload as JwtPayloadWithId;

  try {
    const profissional = await profissionalRepository.buscarProfissionalPorId(
      payload.id_usuario
    );
    const paciente = await pacienteRepository.buscarPacientePorId(
      payload.id_usuario
    );
    if (!profissional && !paciente) {
      return res
        .status(403)
        .json({ message: "Nenhum perfil válido associado a este usuário." });
    }

    req.usuario = {
      id_usuario: payload.id_usuario,
      id_profissional: profissional?.id_profissional,
      id_paciente: paciente?.id_paciente,
    };

    return next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro interno ao verificar os perfis do usuário." });
  }
};
