import { Router } from "express";
import { ProfissionalController } from "../controllers/ProfissionaisController";
import validate from "../middlewares/validate";
import { authMiddleware } from "../middlewares/auth";
import upload from "../config/imgUpload";
import { criarGradeSchema } from "../validators/profissionaisValidator";
import { atualizarPerfilProfissionalSchema } from "../validators/profissionaisValidator";
import { buscarProfissionaisSchema } from "../validators/profissionaisValidator";

const profissionaisRoutes = Router();
const profissionalController = new ProfissionalController();

/**
 * @swagger
 * tags:
 *   - name: Profissionais
 *     description: Endpoints para gerenciar perfis e agendas de profissionais
 */

/**
 * @swagger
 * /api/profissionais/perfil:
 *   patch:
 *     summary: Atualiza parcialmente o perfil do profissional logado
 *     tags: [Profissionais]
 *     description: Permite que um profissional logado altere um ou mais campos do seu perfil, como descrição, valor da consulta ou status de convênio.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *                 example: "Nova biografia aqui."
 *               valor_consulta:
 *                 type: number
 *                 example: 250.00
 *               aceita_convenio:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       '200':
 *         description: Perfil atualizado com sucesso.
 *       '400':
 *         description: Dados inválidos.
 *       '401':
 *         description: Não autorizado.
 *       '403':
 *         description: Acesso negado.
 */

profissionaisRoutes.patch(
  "/perfil",
  authMiddleware,
  validate(atualizarPerfilProfissionalSchema),
  (req, res) => profissionalController.atualizarPerfil(req, res)
);

/**
 * @swagger
 * /api/profissionais/atualizarHorarios:
 *   post:
 *     summary: Atualiza a grade de horários de um profissional
 *     tags: [Profissionais]
 *     description: Substitui a grade de horários de trabalho semanal do profissional logado. Requer autenticação.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 dia_semana:
 *                   type: integer
 *                   description: "1=Segunda, 2=Terça, ..., 7=Domingo"
 *                   example: 2
 *                 horario_inicio:
 *                   type: string
 *                   format: time
 *                   example: "09:00"
 *                 horario_fim:
 *                   type: string
 *                   format: time
 *                   example: "12:00"
 *     responses:
 *       '200':
 *         description: Grade de horários atualizada com sucesso.
 *       '401':
 *         description: Não autorizado (token inválido ou não fornecido).
 *       '403':
 *         description: Acesso negado (usuário não é um profissional).
 */
profissionaisRoutes.post(
  "/atualizarHorarios",
  authMiddleware,
  validate(criarGradeSchema),
  (req, res) => profissionalController.atualizarGradeDeTrabalho(req, res)
);

/**
 * @swagger
 * /api/profissionais/{id}/disponibilidade:
 *   get:
 *     summary: Busca os horários disponíveis de um profissional para uma data
 *     tags: [Profissionais]
 *     description: Retorna uma lista de horários disponíveis para um profissional em uma data específica.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do profissional a ser consultado.
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: A data para a qual a disponibilidade é solicitada (formato AAAA-MM-DD).
 *         example: "2025-08-20"
 *     responses:
 *       '200':
 *         description: Lista de horários disponíveis.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "09:00"
 *       '400':
 *         description: Parâmetros inválidos.
 */
profissionaisRoutes.get("/:id/disponibilidade", (req, res) =>
  profissionalController.buscarDisponibilidade(req, res)
);

/**
 * @swagger
 * /api/profissionais/foto-perfil:
 *   patch:
 *     summary: Atualiza a foto de perfil do profissional logado
 *     tags: [Profissionais]
 *     description: Faz o upload de uma nova imagem e atualiza a foto de perfil do profissional. Requer autenticação.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: O arquivo de imagem a ser enviado.
 *     responses:
 *       '200':
 *         description: Foto de perfil atualizada com sucesso.
 *       '400':
 *         description: Nenhum arquivo enviado.
 *       '401':
 *         description: Não autorizado.
 */
profissionaisRoutes.patch(
  "/foto-perfil",
  authMiddleware,
  upload.single("foto"),
  (req, res) => profissionalController.atualizarFotoPerfil(req, res)
);

/**
 * @swagger
 * /api/profissionais/foto-perfil:
 *   delete:
 *     summary: Remove a foto de perfil do profissional logado
 *     tags: [Profissionais]
 *     description: Deleta a imagem do Cloudinary e limpa a URL no banco de dados. Requer autenticação.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Foto de perfil removida com sucesso.
 *       '401':
 *         description: Não autorizado.
 *       '403':
 *         description: Acesso negado.
 *       '404':
 *         description: Perfil de profissional não encontrado.
 */
profissionaisRoutes.delete("/foto-perfil", authMiddleware, (req, res) =>
  profissionalController.removerFotoPerfil(req, res)
);

/**
 * @swagger
 * /api/profissionais/pacientes-ativos:
 *   get:
 *     summary: Lista os pacientes ativos de um profissional
 *     tags: [Profissionais]
 *     description: Retorna uma lista de todos os pacientes que possuem uma consulta com status 'AGENDADO' com o profissional logado. Requer autenticação.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de pacientes retornada com sucesso.
 *       '401':
 *         description: Não autorizado.
 *       '403':
 *         description: Acesso negado.
 */
profissionaisRoutes.get("/pacientes-ativos", authMiddleware, (req, res) =>
  profissionalController.listarPacientesAtivos(req, res)
);

/**
 * @swagger
 * /api/profissionais:
 *   get:
 *     summary: Busca e filtra profissionais
 *     tags:
 *       - Profissionais
 *     description: Retorna uma lista de profissionais com base nos filtros fornecidos via query params. Rota pública.
 *     parameters:
 *       - in: query
 *         name: especialidade
 *         schema:
 *           type: string
 *         description: >
 *           Filtra por nome da especialidade (ex: Psicologia).
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *         description: >
 *           Filtra pela cidade de um dos endereços do profissional.
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: >
 *           Filtra pelo estado (UF) de um dos endereços do profissional.
 *       - in: query
 *         name: aceita_convenio
 *         schema:
 *           type: boolean
 *         description: >
 *           Filtra por profissionais que aceitam convênio (true/false).
 *       - in: query
 *         name: atende_domicilio
 *         schema:
 *           type: boolean
 *         description: >
 *           Filtra por profissionais que atendem a domicílio (true/false).
 *       - in: query
 *         name: valor_consulta
 *         schema:
 *           type: number
 *         description: >
 *           Filtra por profissionais cujo valor da consulta é menor ou igual ao valor fornecido.
 *       - in: query
 *         name: nota_atendimento
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: >
 *           Filtra por profissionais cuja média de avaliação é maior ou igual ao valor fornecido (1 a 5).
 *     responses:
 *       '200':
 *         description: Lista de profissionais retornada com sucesso.
 *       '400':
 *         description: Filtro com formato inválido.
 */

profissionaisRoutes.get("/", validate(buscarProfissionaisSchema), (req, res) =>
  profissionalController.buscar(req, res)
);

export default profissionaisRoutes;
