import { Request, Response } from "express";
import { EstatisticasService } from "../services/EstatisticasService";

const estatisticasService = new EstatisticasService();

export class EstatisticasController {
  public async getEstatisticasHome(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const estatisticas = await estatisticasService.getEstatisticasHome();

      return res.status(200).json(estatisticas);
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas:", error);

      return res.status(500).json({
        message: "Ocorreu um erro interno ao processar sua solicitação.",
      });
    }
  }
}
