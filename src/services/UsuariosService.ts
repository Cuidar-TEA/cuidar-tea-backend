import hashPassword from "../utils/password";
import {
  criarUsuarioDTO,
  criarContaProfissionalDTO,
  criarContaFamiliaDTO,
} from "../DTOs/usuarioDTO";
import { UsuarioRepository } from "../repositories/UsuariosRepository";
import { PacienteRepository } from "../repositories/PacientesRepository";
import { ProfissionalRepository } from "../repositories/ProfissionaisRepository";
import { EnderecoRepository } from "../repositories/EnderecosRepository";
import { TelefoneRepository } from "../repositories/TelefonesRepository";
import prisma from "../config/prismaClient";

export class UsuarioService {
  private usuarioRepository: UsuarioRepository;
  private pacienteRepository: PacienteRepository;
  private profissionalRepository: ProfissionalRepository;
  private enderecoRepository: EnderecoRepository;
  private telefoneRepository: TelefoneRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.pacienteRepository = new PacienteRepository();
    this.profissionalRepository = new ProfissionalRepository();
    this.enderecoRepository = new EnderecoRepository();
    this.telefoneRepository = new TelefoneRepository();
  }

  public async criarContaFamilia(
    DTOUsuario: criarUsuarioDTO,
    DTOPaciente: criarContaFamiliaDTO
  ) {
    const emailExistente = await this.usuarioRepository.buscarUsuarioPorEmail(
      DTOUsuario.email
    );
    if (emailExistente) throw new Error("Este e-mail já está em uso.");

    const cpfExistente = await this.pacienteRepository.buscarPacientePorCpf(
      DTOPaciente.cpf
    );
    if (cpfExistente) throw new Error("Este CPF já está cadastrado.");

    const senhaHash = await hashPassword(DTOUsuario.senha);

    return prisma.$transaction(async (tx) => {
      const novoUsuario = await this.usuarioRepository.criarNovoUsuario(
        {
          email: DTOUsuario.email,
          senha: senhaHash,
        },
        tx
      );

      const novoEndereco = await this.enderecoRepository.criarNovoEndereco(
        DTOPaciente.endereco,
        tx
      );

      let dadosPaciente;
      if (DTOPaciente.e_titular) {
        // Paciente que se cadastrou é titular, portanto inserimos o nome do paciente e deixamos o campo "nome_titular" como null.
        dadosPaciente = {
          nome_paciente: DTOPaciente.nome_paciente,
          cpf: DTOPaciente.cpf,
          e_titular: true,
          nome_titular: null,
        };
      } else {
        dadosPaciente = {
          // Paciente cadastrado não é titular, então salvamos o nome do paciente e o nome do seu responsável.
          nome_paciente: DTOPaciente.nome_paciente,
          cpf: DTOPaciente.cpf,
          e_titular: false,
          nome_titular: DTOPaciente.nome_titular,
        };
      }

      const novoPaciente = await this.pacienteRepository.criarNovoPaciente(
        {
          usuarios: { connect: { id_usuario: novoUsuario.id_usuario } },
          enderecos: { connect: { id_endereco: novoEndereco.id_endereco } },
          ...dadosPaciente,
          data_nascimento: new Date(DTOPaciente.data_nascimento),
          nivel_tea: DTOPaciente.nivel_tea,
        },
        tx
      );

      await this.telefoneRepository.criarNovoTelefone(
        {
          usuarios: { connect: { id_usuario: novoUsuario.id_usuario } },
          ...DTOPaciente.telefone,
        },
        tx
      );

      const { senha, ...usuarioSeguro } = novoUsuario;
      return { usuario: usuarioSeguro, paciente: novoPaciente };
    });
  }

  public async criarContaProfissional(
    DTOUsuario: criarUsuarioDTO,
    DTOProfissional: criarContaProfissionalDTO
  ) {
    const emailExistente = await this.usuarioRepository.buscarUsuarioPorEmail(
      DTOUsuario.email
    );
    if (emailExistente) throw new Error("Este e-mail já está em uso.");

    const cpfExistente =
      await this.profissionalRepository.buscarProfissionalPorCpf(
        DTOProfissional.cpf
      );
    if (cpfExistente) throw new Error("Este CPF já está cadastrado.");

    const senhaHash = await hashPassword(DTOUsuario.senha);

    return prisma.$transaction(async (tx) => {
      const novoUsuario = await this.usuarioRepository.criarNovoUsuario(
        {
          email: DTOUsuario.email,
          senha: senhaHash,
        },
        tx
      );

      const novoEndereco = await this.enderecoRepository.criarNovoEndereco(
        DTOProfissional.endereco,
        tx
      );

      const novoProfissional =
        await this.profissionalRepository.criarNovoProfissional(
          {
            usuarios: { connect: { id_usuario: novoUsuario.id_usuario } },
            enderecos: { connect: { id_endereco: novoEndereco.id_endereco } },
            nome: DTOProfissional.nome,
            cpf: DTOProfissional.cpf,
            tipo_registro: DTOProfissional.tipo_registro,
            numero_registro: DTOProfissional.numero_registro,
            uf_registro: DTOProfissional.uf_registro,
            profissional_especialidades: {
              create: DTOProfissional.especialidades.map(
                (nomeEspecialidade) => ({
                  especialidades: {
                    connectOrCreate: {
                      where: { nome_especialidade: nomeEspecialidade },
                      create: { nome_especialidade: nomeEspecialidade },
                    },
                  },
                })
              ),
            },
            profissional_formacoes: {
              create: DTOProfissional.formacoes.map((nomeFormacao) => ({
                formacoes: {
                  connectOrCreate: {
                    where: { formacao: nomeFormacao },
                    create: { formacao: nomeFormacao },
                  },
                },
              })),
            },
          },
          tx
        );

      await this.telefoneRepository.criarNovoTelefone(
        {
          usuarios: { connect: { id_usuario: novoUsuario.id_usuario } },
          ...DTOProfissional.telefone,
        },
        tx
      );

      const { senha, ...usuarioSeguro } = novoUsuario;
      return { usuario: usuarioSeguro, profissional: novoProfissional };
    });
  }
}
