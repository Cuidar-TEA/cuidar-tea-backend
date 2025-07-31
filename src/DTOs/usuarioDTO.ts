import {
  telefones_tipo,
  profissionais_tipo_registro,
  pacientes_nivel_tea,
} from "../generated/prisma";

interface criarUsuarioDTO {
  email: string;
  senha: string;
}

interface criarTelefoneDTO {
  ddd: string;
  numero: string;
  tipo: telefones_tipo;
}

interface criarContaProfissionalDTO {
  nome: string;
  cpf: string;
  telefone: criarTelefoneDTO;
  formacoes: string[]; // Array para armazenar a(s) formação(ões) do profissional.
  especialidades: string[]; // Array para armazenar a(s) especialidade(s) do profissional.
  numero_registro: string;
  tipo_registro: profissionais_tipo_registro;
  uf_registro: string;
  endereco: criarEnderecoDTO;
}

interface criarContaFamiliaDTO {
  nome_titular?: string; // Nome do titular será inserido caso o paciente seja dependente.
  cpf: string; // CPF do paciente.
  telefone: criarTelefoneDTO;
  endereco: criarEnderecoDTO; // Endereço do paciente para atendimento domiciliar.
  e_titular: boolean; // Se for "true", o paciente com TEA é quem fez o cadastro. Caso contrário, ele é dependente e o campo "nome_titular" deixa de ser null.
  nome_paciente: string;
  data_nascimento: string;
  nivel_tea: pacientes_nivel_tea; // Devido à formatação do prisma, os valores aceitos aqui são: "N_VEL_1, N_VEL_2, N_VEL_3".
}

interface criarEnderecoDTO {
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
  apelido_endereco?: string;
}

export {
  criarUsuarioDTO,
  criarTelefoneDTO,
  criarContaProfissionalDTO,
  criarContaFamiliaDTO,
  criarEnderecoDTO,
};
