import { z } from "zod";

export const criarAgendamentoSchema = z.object({
  body: z.object({
    profissionais_id_profissional: z
      .number()
      .int()
      .positive("O ID do profissional deve ser um número positivo."),
    enderecos_id_endereco: z
      .number()
      .int()
      .positive("O ID do endereço deve ser um número positivo."),
    data_horario_inicio: z.coerce.date(),
    duracao_consulta_minutos: z
      .number()
      .int()
      .positive("A duração da consulta deve ser um número positivo."),
  }),
});

export const avaliarAgendamentoSchema = z.object({
  body: z.object({
    nota_atendimento: z
      .number()
      .min(1, "A nota deve ser no mínimo 1.")
      .max(5, "A nota deve ser no máximo 5."),
    avaliacao: z.string().optional(), // O feedback da avaliacao é opcional.
  }),
  params: z.object({
    id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "O ID do agendamento na URL deve ser um número.",
    }),
  }),
});

export type CriarAgendamentoDTO = z.infer<
  typeof criarAgendamentoSchema
>["body"];

export type AvaliarAgendamentoDTO = z.infer<
  typeof avaliarAgendamentoSchema
>["body"];
