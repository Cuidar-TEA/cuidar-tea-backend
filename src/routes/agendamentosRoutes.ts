import { Router } from "express";
import { AgendamentosController } from "../controllers/AgendamentosController";
import { authMiddleware } from "../middlewares/auth";
import validate from "../middlewares/validate";
import { criarAgendamentoSchema } from "../validators/agendamentosValidator";
import { avaliarAgendamentoSchema } from "../validators/agendamentosValidator";

const agendamentosRoutes = Router();
const agendamentosController = new AgendamentosController();

/**
 * @swagger
 * tags:
 *   - name: Agendamentos
 *     description: Endpoints para criar e gerenciar agendamentos
 */

/**
 * @swagger
 * /api/agendamentos:
 *   post:
 *     summary: Cria um novo agendamento
 *     tags: [Agendamentos]
 *     description: Cria um novo agendamento para o paciente autenticado. Requer token de autenticação.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profissionais_id_profissional
 *               - enderecos_id_endereco
 *               - data_horario_inicio
 *               - duracao_consulta_minutos
 *             properties:
 *               profissionais_id_profissional:
 *                 type: integer
 *                 description: O ID do perfil do profissional.
 *                 example: 1
 *               enderecos_id_endereco:
 *                 type: integer
 *                 description: O ID do endereço do consultório onde a consulta ocorrerá.
 *                 example: 1
 *               data_horario_inicio:
 *                 type: string
 *                 format: date-time
 *                 description: A data e hora de início da consulta no formato ISO 8601.
 *                 example: "2025-08-20T14:00:00.000Z"
 *               duracao_consulta_minutos:
 *                 type: integer
 *                 description: A duração da consulta em minutos.
 *                 example: 60
 *     responses:
 *       '201':
 *         description: Agendamento criado com sucesso. Retorna o objeto do agendamento.
 *       '400':
 *         description: Dados inválidos fornecidos.
 *       '401':
 *         description: Não autorizado (token inválido ou não fornecido).
 *       '403':
 *         description: Acesso negado (usuário logado não é um paciente).
 *       '409':
 *         description: Conflito (o horário solicitado já foi preenchido).
 */
agendamentosRoutes.post(
  "/",
  authMiddleware,
  validate(criarAgendamentoSchema),
  (req, res) => agendamentosController.criarAgendamento(req, res)
);

/**
 * @swagger
 * /api/agendamentos/{id}/avaliar:
 *   patch:
 *     summary: Adiciona uma avaliação a um agendamento concluído
 *     tags: [Agendamentos]
 *     description: Permite que um paciente logado adicione uma nota e um comentário a um agendamento com status 'FINALIZADO'. Requer autenticação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do agendamento a ser avaliado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nota_atendimento
 *             properties:
 *               nota_atendimento:
 *                 type: number
 *                 description: Nota de 1 a 5.
 *                 example: 5
 *               avaliacao:
 *                 type: string
 *                 description: Comentário de texto (opcional).
 *                 example: "Excelente profissional, muito atencioso."
 *     responses:
 *       '200':
 *         description: Avaliação adicionada com sucesso.
 *       '400':
 *         description: "Requisição inválida (ex: agendamento não está finalizado)."
 *       '401':
 *         description: "Não autorizado (token inválido)."
 *       '403':
 *         description: "Acesso negado (tentando avaliar a consulta de outra pessoa)."
 *       '404':
 *         description: "Agendamento não encontrado."
 *       '409':
 *         description: "Conflito (o agendamento já foi avaliado)."
 */
agendamentosRoutes.patch(
  "/:id/avaliar",
  authMiddleware,
  validate(avaliarAgendamentoSchema),
  (req, res) => agendamentosController.adicionarAvaliacao(req, res)
);

/**
 * @swagger
 * /api/agendamentos/{id}/finalizar:
 *   patch:
 *     summary: Finaliza um agendamento
 *     tags: [Agendamentos]
 *     description: Altera o status de um agendamento de 'AGENDADO' para 'FINALIZADO'. Requer autenticação do paciente ou do profissional da consulta.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do agendamento a ser finalizado.
 *     responses:
 *       '200':
 *         description: "Agendamento finalizado com sucesso."
 *       '400':
 *         description: "Requisição inválida (ex: agendamento não estava agendado)."
 *       '401':
 *         description: "Não autorizado (token inválido)."
 *       '403':
 *         description: "Acesso negado (usuário não faz parte da consulta)."
 *       '404':
 *         description: "Agendamento não encontrado."
 */
agendamentosRoutes.patch("/:id/finalizar", authMiddleware, (req, res) =>
  agendamentosController.finalizarAgendamento(req, res)
);

/**
 * @swagger
 * /api/agendamentos/{id}/cancelar:
 *   patch:
 *     summary: Cancela um agendamento
 *     tags: [Agendamentos]
 *     description: Altera o status de um agendamento de 'AGENDADO' para 'CANCELADO'. Requer autenticação do paciente ou do profissional da consulta.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do agendamento a ser cancelado.
 *     responses:
 *       '200':
 *         description: "Agendamento cancelado com sucesso."
 *       '400':
 *         description: "Requisição inválida (ex: agendamento já estava finalizado)."
 *       '401':
 *         description: "Não autorizado (token inválido)."
 *       '403':
 *         description: "Acesso negado (usuário não faz parte da consulta)."
 *       '404':
 *         description: "Agendamento não encontrado."
 */
agendamentosRoutes.patch("/:id/cancelar", authMiddleware, (req, res) =>
  agendamentosController.cancelarAgendamento(req, res)
);

/**
 * @swagger
 * /api/agendamentos/meus:
 *   get:
 *     summary: Lista os agendamentos do paciente logado
 *     tags: [Agendamentos]
 *     description: Retorna um histórico de todas as consultas agendadas pelo paciente que está autenticado. Requer autenticação de paciente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de agendamentos retornada com sucesso.
 *       '401':
 *         description: Não autorizado (token inválido ou não fornecido).
 *       '403':
 *         description: Acesso negado (usuário logado não é um paciente).
 */
agendamentosRoutes.get("/meus", authMiddleware, (req, res) =>
  agendamentosController.listarMeusAgendamentos(req, res)
);

export default agendamentosRoutes;
