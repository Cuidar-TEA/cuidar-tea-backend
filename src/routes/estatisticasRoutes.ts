import { Router } from "express";

import { EstatisticasController } from "../controllers/EstatisticasController";

const estatisticasRoutes = Router();
const estatisticasController = new EstatisticasController();

/**
 * @swagger
 * /api/estatisticas/home:
 *   get:
 *     summary: Busca estatísticas para a página inicial
 *     tags: [Estatísticas]
 *     description: Retorna a quantidade de profissionais, pacientes e média de avaliações.
 *     responses:
 *       '200':
 *         description: Estatísticas retornadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quantidadeProfissionais:
 *                   type: integer
 *                   example: 150
 *                 quantidadePacientes:
 *                   type: integer
 *                   example: 320
 *                 mediaAvaliacoes:
 *                   type: number
 *                   format: float
 *                   example: 4.7
 *       '500':
 *         description: Erro interno do servidor.
 */
estatisticasRoutes.get("/home", (req, res) =>
  estatisticasController.getEstatisticasHome(req, res)
);

export default estatisticasRoutes;
