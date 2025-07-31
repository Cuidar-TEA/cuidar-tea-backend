// Local do arquivo: src/routes/usuariosRoutes.ts

import { Router } from "express";
import { UsuarioController } from "../controllers/UsuariosController";
import { LoginController } from "../controllers/LoginController";
import validate from "../middlewares/validate";
import {
  criarContaFamiliaSchema,
  criarContaProfissionalSchema,
} from "../validators/usuariosValidator";

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();
const loginController = new LoginController();

/**
 * @swagger
 * tags:
 *   - name: Autenticação e Usuários
 *     description: Endpoints para criação de contas e login.
 */

/**
 * @swagger
 * /api/usuarios/criarContaFamilia:
 *   post:
 *     summary: Cria uma nova conta de família/paciente
 *     tags: [Autenticação e Usuários]
 *     description: Endpoint para o cadastro de um novo usuário do tipo paciente ou familiar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *               - cpf
 *               - e_titular
 *               - nome_paciente
 *               - data_nascimento
 *               - nivel_tea
 *               - telefone
 *               - endereco
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email de login para a nova conta.
 *                 example: "familia.nova@email.com"
 *               senha:
 *                 type: string
 *                 description: Senha de acesso, mínimo de 8 caracteres.
 *                 example: "senhaForte123"
 *               nome_titular:
 *                 type: string
 *                 description: Nome completo do responsável (obrigatório se e_titular for false).
 *                 example: "Maria da Silva"
 *               cpf:
 *                 type: string
 *                 description: CPF do paciente (titular ou dependente).
 *                 example: "11122233344"
 *               e_titular:
 *                 type: boolean
 *                 description: Flag que indica se o titular da conta é o próprio paciente.
 *                 example: false
 *               nome_paciente:
 *                 type: string
 *                 description: Nome completo do paciente com TEA.
 *                 example: "Pedro da Silva"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento do paciente no formato AAAA-MM-DD.
 *                 example: "2018-05-10"
 *               nivel_tea:
 *                 type: string
 *                 enum: [N_VEL_1, N_VEL_2, N_VEL_3]
 *                 description: Nível de suporte do TEA, conforme schema do Prisma.
 *                 example: "N_VEL_2"
 *               telefone:
 *                 type: object
 *                 properties:
 *                   ddd:
 *                     type: string
 *                     example: "85"
 *                   numero:
 *                     type: string
 *                     example: "988776655"
 *                   tipo:
 *                     type: string
 *                     enum: [CELULAR, RESIDENCIAL, COMERCIAL]
 *                     example: "CELULAR"
 *               endereco:
 *                 type: object
 *                 properties:
 *                   cep:
 *                     type: string
 *                     example: "60170001"
 *                   logradouro:
 *                     type: string
 *                     example: "Av. Dom Luís"
 *                   numero:
 *                     type: string
 *                     example: "500"
 *                   bairro:
 *                     type: string
 *                     example: "Aldeota"
 *                   cidade:
 *                     type: string
 *                     example: "Fortaleza"
 *                   estado:
 *                     type: string
 *                     example: "CE"
 *     responses:
 *       '201':
 *         description: Conta criada com sucesso.
 *       '400':
 *         description: Dados inválidos fornecidos.
 *       '409':
 *         description: Email ou CPF já cadastrado.
 */
usuarioRoutes.post(
  "/criarContaFamilia",
  validate(criarContaFamiliaSchema),
  (req, res) => usuarioController.criarContaFamilia(req, res)
);

/**
 * @swagger
 * /api/usuarios/criarContaProfissional:
 *   post:
 *     summary: Cria uma nova conta de profissional
 *     tags: [Autenticação e Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "profissional@email.com"
 *               senha:
 *                 type: string
 *                 example: "senhaProfissional123"
 *               nome:
 *                 type: string
 *                 example: "Dr. João"
 *               cpf:
 *                 type: string
 *                 example: "33344455566"
 *               telefone:
 *                 type: object
 *                 properties:
 *                   ddd:
 *                     type: string
 *                     example: "11"
 *                   numero:
 *                     type: string
 *                     example: "987654321"
 *                   tipo:
 *                     type: string
 *                     enum: [CELULAR, RESIDENCIAL, COMERCIAL]
 *                     example: "COMERCIAL"
 *               formacoes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Medicina - USP", "Residência em Neuro"]
 *               especialidades:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Neurologista"]
 *               numero_registro:
 *                 type: string
 *                 example: "123456"
 *               tipo_registro:
 *                 type: string
 *                 enum: [CRM, CRP, CRFa, CREFITO, CREA]
 *                 example: "CRM"
 *               uf_registro:
 *                 type: string
 *                 example: "SP"
 *               endereco:
 *                 type: object
 *                 properties:
 *                   cep:
 *                     type: string
 *                     example: "01311000"
 *                   logradouro:
 *                     type: string
 *                     example: "Avenida Paulista"
 *                   numero:
 *                     type: string
 *                     example: "1800"
 *                   bairro:
 *                     type: string
 *                     example: "Bela Vista"
 *                   cidade:
 *                     type: string
 *                     example: "São Paulo"
 *                   estado:
 *                     type: string
 *                     example: "SP"
 *     responses:
 *       '201':
 *         description: Conta criada com sucesso.
 *       '400':
 *         description: Dados inválidos fornecidos.
 *       '409':
 *         description: Email ou CPF já cadastrado.
 */
usuarioRoutes.post(
  "/criarContaProfissional",
  validate(criarContaProfissionalSchema),
  (req, res) => usuarioController.criarContaProfissional(req, res)
);

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Realiza o login de um usuário
 *     tags: [Autenticação e Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@email.com"
 *               senha:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       '200':
 *         description: Login bem-sucedido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 tipoUsuario:
 *                   type: string
 *                   example: "paciente"
 *       '401':
 *         description: Não autorizado (email ou senha inválidos).
 */
usuarioRoutes.post("/login", (req, res) => loginController.login(req, res));

export default usuarioRoutes;
