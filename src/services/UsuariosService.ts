import prisma from "../config/prismaClient";
import hashPassword from "../utils/password";
import {
  criarUsuarioDTO,
  criarContaProfissionalDTO,
  criarContaFamiliaDTO,
} from "../DTOs/usuarioDTO";

export class UsuarioService {
  public async criarContaFamilia(
    DTOUsuario: criarUsuarioDTO,
    DTOPaciente: criarContaFamiliaDTO
  ) {
    const emailExistente = await prisma.usuarios.findUnique({
      where: { email: DTOUsuario.email },
    });
    if (emailExistente) throw new Error("Este e-mail já está em uso.");

    const cpfExistente = await prisma.pacientes.findUnique({
      where: { cpf: DTOPaciente.cpf },
    });
    if (cpfExistente) throw new Error("Este CPF já está cadastrado.");

    const senhaHash = await hashPassword(DTOUsuario.senha);
    return prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuarios.create({
        data: {
          email: DTOUsuario.email,
          senha: senhaHash,
        },
      });

      const novoEndereco = await tx.enderecos.create({
        data: {
          cep: DTOPaciente.endereco.cep,
          logradouro: DTOPaciente.endereco.logradouro,
          numero: DTOPaciente.endereco.numero,
          bairro: DTOPaciente.endereco.bairro,
          cidade: DTOPaciente.endereco.cidade,
          estado: DTOPaciente.endereco.estado,
          complemento: DTOPaciente.endereco.complemento,
          apelido_endereco: DTOPaciente.endereco.apelido_endereco,
        },
      });

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

      const novoPaciente = await tx.pacientes.create({
        data: {
          usuarios_id_usuario: novoUsuario.id_usuario,
          enderecos_id_endereco: novoEndereco.id_endereco,
          ...dadosPaciente,
          data_nascimento: new Date(DTOPaciente.data_nascimento),
          nivel_tea: DTOPaciente.nivel_tea,
        },
      });

      await tx.telefones.create({
        data: {
          usuarios_id_usuario: novoUsuario.id_usuario,
          ddd: DTOPaciente.telefone.ddd,
          numero: DTOPaciente.telefone.numero,
          tipo: DTOPaciente.telefone.tipo,
        },
      });

      const { senha, ...usuarioSeguro } = novoUsuario;
      return { usuario: usuarioSeguro, paciente: novoPaciente };
    });
  }

  public async criarContaProfissional(
    DTOUsuario: criarUsuarioDTO,
    DTOProfissional: criarContaProfissionalDTO
  ) {
    const emailExistente = await prisma.usuarios.findUnique({
      where: { email: DTOUsuario.email },
    });
    if (emailExistente) throw new Error("Este e-mail já está em uso.");

    const cpfExistente = await prisma.profissionais.findUnique({
      where: { cpf: DTOProfissional.cpf },
    });
    if (cpfExistente) throw new Error("Este CPF já está cadastrado.");

    const senhaHash = await hashPassword(DTOUsuario.senha);
    return prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuarios.create({
        data: {
          email: DTOUsuario.email,
          senha: senhaHash,
        },
      });

      const novoEndereco = await tx.enderecos.create({
        data: {
          ...DTOProfissional.endereco,
        },
      });

      const novoProfissional = await tx.profissionais.create({
        data: {
          usuarios_id_usuario: novoUsuario.id_usuario,
          enderecos_id_endereco: novoEndereco.id_endereco,
          nome: DTOProfissional.nome,
          cpf: DTOProfissional.cpf,
          tipo_registro: DTOProfissional.tipo_registro,
          numero_registro: DTOProfissional.numero_registro,
          uf_registro: DTOProfissional.uf_registro,

          // Procura pela especialidade na tabela. Caso já exista, resgata a existente. Do contrário, apenas cria uma nova.
          profissional_especialidades: {
            create: DTOProfissional.especialidades.map((nomeEspecialidade) => ({
              especialidades: {
                connectOrCreate: {
                  where: { nome_especialidade: nomeEspecialidade },
                  create: { nome_especialidade: nomeEspecialidade },
                },
              },
            })),
          },
          // Procura pela formação na tabela. Caso já exista, resgata a existente. Do contrário, apenas cria uma nova.
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
      });

      await tx.telefones.create({
        data: {
          usuarios_id_usuario: novoUsuario.id_usuario,
          ...DTOProfissional.telefone,
        },
      });

      const { senha, ...usuarioSeguro } = novoUsuario;
      return { usuario: usuarioSeguro, profissional: novoProfissional };
    });
  }
}
