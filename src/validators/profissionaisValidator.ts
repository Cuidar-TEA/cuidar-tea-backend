import { z } from "zod";

export const buscarProfissionaisSchema = z.object({
  query: z.object({
    especialidade: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    aceita_convenio: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    nota_atendimento: z.coerce.number().min(1).max(5).optional(),
    valor_consulta: z.coerce.number().min(1).optional(),
    atende_domicilio: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    nome: z
      .string()
      .trim()
      .min(1, "O nome não pode ser vazio.")
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, {
        message: "O nome deve conter apenas letras e espaços.",
      })
      .optional(),
    formacao: z
      .string()
      .trim()
      .min(1, "A formação não pode ser vazia.")
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, {
        message: "A formação deve conter apenas letras e espaços.",
      })
      .optional(),
  }),
});

export const atualizarPerfilProfissionalSchema = z.object({
  body: z.object({
    descricao: z.string().nullable().optional(),
    valor_consulta: z
      .number()
      .positive("O valor da consulta deve ser um número positivo.")
      .nullable()
      .optional(),
    aceita_convenio: z.boolean().optional(),
  }),
});

export const horariosTrabalhoSchema = z
  .object({
    dia_semana: z
      .number()
      .int()
      .min(1, "O dia da semana deve ser no mínimo 1 (Domingo).")
      .max(7, "O dia da semana deve ser no máximo 7 (Sábado)."),
    // Valida se a string está no formato "HH:MM" (ex: "09:00" ou "23:59").
    horario_inicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Formato de hora de início inválido. Use HH:MM.",
    }),
    horario_fim: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Formato de hora de fim inválido. Use HH:MM.",
    }),
  })
  .refine(
    (data) => {
      return data.horario_fim > data.horario_inicio;
    },
    {
      message: "O horário de término deve ser posterior ao horário de início.",
      path: ["horario_fim"],
    }
  );

// Grade de horários.
export const criarGradeSchema = z.object({
  body: z.array(horariosTrabalhoSchema),
});

export type HorariosTrabalhoDTO = z.infer<typeof horariosTrabalhoSchema>;
export type AtualizarPerfilProfissionalDTO = z.infer<
  typeof atualizarPerfilProfissionalSchema
>["body"];
export type BuscarProfissionaisDTO = z.infer<
  typeof buscarProfissionaisSchema
>["query"];
