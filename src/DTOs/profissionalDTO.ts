import { Prisma } from "../generated/prisma";

export interface HorariosDeTrabalhoDTO {
  dia_semana: number;
  horario_inicio: string;
  horario_fim: string;
}

export const profissionalDestaquePayload =
  Prisma.validator<Prisma.profissionaisDefaultArgs>()({
    include: {
      enderecos: {
        select: {
          cidade: true,
          estado: true,
        },
      },
      profissional_formacoes: {
        include: {
          formacoes: true,
        },
      },
      agendamentos: {
        where: {
          nota_atendimento: {
            not: null,
          },
        },
        select: {
          nota_atendimento: true,
        },
      },
    },
  });

export type ProfissionalDestaque = Prisma.profissionaisGetPayload<
  typeof profissionalDestaquePayload
>;
