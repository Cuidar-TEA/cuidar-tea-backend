import { Request, Response } from "express";
import { ProfissionalService } from "../services/ProfissionaisService";
import {
  buscarProfissionaisSchema,
  HorariosTrabalhoDTO,
} from "../validators/profissionaisValidator";
import { AtualizarPerfilProfissionalDTO } from "../validators/profissionaisValidator";
import { BuscarProfissionaisDTO } from "../validators/profissionaisValidator";
import z from "zod";

const profissionalService = new ProfissionalService();

export class ProfissionalController {
  public async atualizarGradeDeTrabalho(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const idProfissional = req.usuario?.id_profissional;
      if (!idProfissional) {
        return res.status(403).json({
          message:
            "Acesso negado. Apenas profissionais podem realizar esta ação.",
        });
      }

      const gradeDeTrabalho: HorariosTrabalhoDTO[] = req.body;
      const resultado = await profissionalService.atualizarGradeDeTrabalho(
        idProfissional,
        gradeDeTrabalho
      );
      return res.status(200).json(resultado);
    } catch (error: any) {
      if (error.message.includes("já está cadastrado")) {
        return res.status(409).json({ message: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ message: "Ocorreu um erro interno no servidor." });
    }
  }

  public async buscarDisponibilidade(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const idProfissional = parseInt(req.params.id);
      if (isNaN(idProfissional)) {
        return res
          .status(400)
          .json({ message: "ID do profissional inválido." });
      }
      const dataString = req.query.data as string;
      if (!dataString) {
        return res
          .status(400)
          .json({ message: "O parâmetro 'data' é obrigatório." });
      }
      const [ano, mes, dia] = dataString.split("-").map(Number);
      const data = new Date(ano, mes - 1, dia);
      if (isNaN(data.getTime())) {
        return res
          .status(400)
          .json({ message: "Formato de data inválido. Use AAAA-MM-DD." });
      }

      const disponibilidade = await profissionalService.calcularDisponibilidade(
        idProfissional,
        data
      );
      return res.status(200).json(disponibilidade);
    } catch (error: any) {
      console.error("Erro ao buscar disponibilidade:", error);
      return res.status(500).json({
        message: "Ocorreu um erro interno ao processar sua solicitação.",
      });
    }
  }

  public async atualizarFotoPerfil(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const idProfissional = req.usuario?.id_profissional;
      if (!idProfissional) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Nenhum arquivo de imagem foi enviado." });
      }

      const urlDaFoto = (req.file as any).path || (req.file as any).url;
      const resultado = await profissionalService.atualizarFotoPerfil(
        idProfissional,
        urlDaFoto
      );

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.error(
        "Erro ao atualizar foto de perfil:",
        error.message || error
      );
      return res.status(500).json({
        message: "Ocorreu um erro interno no servidor.",
        error: error.message || error,
      });
    }
  }

  public async removerFotoPerfil(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const idProfissional = req.usuario?.id_profissional;
      if (!idProfissional) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      const resultado = await profissionalService.removerFotoPerfil(
        idProfissional
      );

      return res.status(200).json(resultado);
    } catch (error: any) {
      if (error.message.includes("não encontrado")) {
        return res.status(404).json({ message: error.message });
      }
      console.error("Erro ao remover foto de perfil:", error);
      return res.status(500).json({ message: "Ocorreu um erro interno." });
    }
  }

  public async atualizarPerfil(req: Request, res: Response): Promise<Response> {
    try {
      const idProfissional = req.usuario?.id_profissional;
      if (!idProfissional) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      const dadosParaAtualizar: AtualizarPerfilProfissionalDTO = req.body;
      const resultado = await profissionalService.atualizarPerfil(
        idProfissional,
        dadosParaAtualizar
      );

      return res.status(200).json(resultado);
    } catch (error: any) {
      if (error.message.includes("não encontrado")) {
        return res.status(404).json({ message: error.message });
      }
      console.error("Erro ao atualizar perfil do profissional:", error);
      return res.status(500).json({ message: "Ocorreu um erro interno." });
    }
  }

  public async listarPacientesAtivos(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const idProfissional = req.usuario?.id_profissional;
      if (!idProfissional) {
        return res.status(403).json({
          message:
            "Acesso negado. Apenas profissionais podem realizar esta ação.",
        });
      }

      const pacientes = await profissionalService.listarPacientesAtivos(
        idProfissional
      );

      return res.status(200).json(pacientes);
    } catch (error: any) {
      console.error("Erro ao listar pacientes ativos:", error);
      return res.status(500).json({ message: "Ocorreu um erro interno." });
    }
  }

  public async buscar(req: Request, res: Response): Promise<Response> {
    try {
      const validatedQuery = buscarProfissionaisSchema.parse({
        query: req.query,
      });
      const filtros: BuscarProfissionaisDTO = validatedQuery.query;

      const resultado = await profissionalService.buscarProfissionais(filtros);

      return res.status(200).json(resultado);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação nos filtros.",
          errors: error,
        });
      }

      console.error("Erro ao buscar profissionais:", error);
      return res
        .status(500)
        .json({ message: "Ocorreu um erro interno ao buscar profissionais." });
    }
  }

  public async listarDestaques(req: Request, res: Response): Promise<Response> {
    try {
      const destaques = await profissionalService.listarDestaques();
      return res.status(200).json(destaques);
    } catch (error: any) {
      console.error("Erro ao listar profissionais em destaque:", error);
      return res.status(500).json({ message: "Ocorreu um erro interno." });
    }
  }

  public async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const profissional = await profissionalService.buscarPorId(Number(id));
      if (!profissional)
        return res
          .status(404)
          .json({ message: "Profissional não encontrado." });
      return res.status(200).json(profissional);
    } catch (error: any) {
      console.error("Erro ao buscar profissional por id:", error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  }
}
