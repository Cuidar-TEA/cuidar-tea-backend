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
 *     description: Permite que um profissional logado altere um ou mais campos do seu perfil.
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
 *                 nullable: true
 *                 example: "Nova biografia aqui."
 *               valor_consulta:
 *                 type: number
 *                 nullable: true
 *                 example: 250.00
 *               aceita_convenio:
 *                 type: boolean
 *                 example: true
 *               atende_domicilio:
 *                 type: boolean
 *                 example: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Terapia ABA", "Comunicação Alternativa"]
 *               idiomas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Português", "Inglês"]
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
 *     summary: Busca, filtra e pagina profissionais
 *     tags:
 *       - Profissionais
 *     description: "Retorna uma lista paginada de profissionais com base nos filtros fornecidos via query params. Rota pública."
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Número da página para a paginação."
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: "Número de resultados por página."
 *       - in: query
 *         name: especialidade
 *         schema:
 *           type: string
 *         description: "Filtra por nome da especialidade (ex: Psicologia)."
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *         description: "Filtra pela cidade de um dos endereços do profissional."
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: "Filtra pelo estado (UF) de um dos endereços do profissional."
 *       - in: query
 *         name: aceita_convenio
 *         schema:
 *           type: boolean
 *         description: "Filtra por profissionais que aceitam convênio (true/false)."
 *       - in: query
 *         name: nota_atendimento
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: "Filtra por profissionais com média de avaliação maior ou igual ao valor fornecido (1 a 5)."
 *       - in: query
 *         name: valor_consulta
 *         schema:
 *           type: number
 *           minimum: 1
 *         description: "Filtra por profissionais cujo valor da consulta é menor ou igual ao valor fornecido."
 *       - in: query
 *         name: atende_domicilio
 *         schema:
 *           type: boolean
 *         description: "Filtra por profissionais que atendem a domicílio (true/false)."
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: "Filtra por parte do nome do profissional."
 *       - in: query
 *         name: formacao
 *         schema:
 *           type: string
 *         description: "Filtra pela profissão principal do profissional (ex: Fisioterapeuta)."
 *     responses:
 *       '200':
 *         description: "Lista de profissionais retornada com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profissionais:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                   example: 150
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       '400':
 *         description: "Filtro com formato inválido."
 */
profissionaisRoutes.get("/", validate(buscarProfissionaisSchema), (req, res) =>
  profissionalController.buscar(req, res)
);

/**
 * @swagger
 * /api/profissionais/destaques:
 *   get:
 *     summary: Lista os profissionais em destaque
 *     tags: [Profissionais]
 *     description: "Retorna uma lista dos 5 profissionais com as melhores avaliações (acima da média geral), ideais para a seção de destaques da aplicação."
 *     responses:
 *       '200':
 *         description: Lista de profissionais em destaque retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_profissional:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   foto_perfil_url:
 *                     type: string
 *                     nullable: true
 *                   formacao:
 *                     type: string
 *                     description: "A principal formação do profissional (ex: Fonoaudióloga)."
 *                   cidade:
 *                     type: string
 *                   estado:
 *                     type: string
 *                   valor_consulta:
 *                     type: number
 *                   avaliacao_media:
 *                     type: number
 *                   total_avaliacoes:
 *                     type: integer
 *                   proxima_disponibilidade:
 *                     type: string
 *                     example: "Hoje às 17:00"
 *       '500':
 *         description: Erro interno do servidor.
 */
profissionaisRoutes.get("/destaques", (req, res) =>
  profissionalController.listarDestaques(req, res)
);

/**
 * @swagger
 * /api/profissionais/{id}:
 *   get:
 *     summary: Busca um profissional específico pelo ID
 *     tags: [Profissionais]
 *     description: Retorna os dados detalhados de um único profissional, ideal para a página de perfil.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do profissional a ser buscado.
 *     responses:
 *       '200':
 *         description: Dados do profissional retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_profissional:
 *                   type: integer
 *                 usuarios_id_usuario:
 *                   type: integer
 *                 enderecos_id_endereco:
 *                   type: integer
 *                 foto_perfil_url:
 *                   type: string
 *                 nome:
 *                   type: string
 *                 cpf:
 *                   type: string
 *                 tipo_registro:
 *                   type: string
 *                 numero_registro:
 *                   type: string
 *                 uf_registro:
 *                   type: string
 *                 descricao:
 *                   type: string
 *                 valor_consulta:
 *                   type: string
 *                 aceita_convenio:
 *                   type: boolean
 *                 atende_domicilio:
 *                   type: integer
 *                 profissional_tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tags_id_tag:
 *                         type: integer
 *                       profissionais_id_profissional:
 *                         type: integer
 *                       tags:
 *                         type: object
 *                         properties:
 *                           id_tag:
 *                             type: integer
 *                           nome_tag:
 *                             type: string
 *                 profissional_idiomas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idiomas_id_idioma:
 *                         type: integer
 *                       profissionais_id_profissional:
 *                         type: integer
 *                       idiomas:
 *                         type: object
 *                         properties:
 *                           id_idioma:
 *                             type: integer
 *                           idioma:
 *                             type: string
 *                 profissional_especialidades:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       profissionais_id_profissional:
 *                         type: integer
 *                       especialidades_id_especialidade:
 *                         type: integer
 *                       especialidades:
 *                         type: object
 *                         properties:
 *                           id_especialidade:
 *                             type: integer
 *                           nome_especialidade:
 *                             type: string
 *                 profissional_formacoes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       formacoes_id_formacao:
 *                         type: integer
 *                       profissionais_id_profissional:
 *                         type: integer
 *                       formacoes:
 *                         type: object
 *                         properties:
 *                           id_formacao:
 *                             type: integer
 *                           formacao:
 *                             type: string
 *       '404':
 *         description: Profissional não encontrado.
 *       '500':
 *         description: Erro interno do servidor.
 */
profissionaisRoutes.get("/:id", (req, res) => {
  profissionalController.buscarPorId(req, res);
});

export default profissionaisRoutes;
