export function timeStringToDate(timeString: string): Date {
  /* Usa uma data base fixa (o dia não importa) e anexa o horário.
   O 'Z' no final indica que o horário está em UTC, evitando problemas de fuso horário.*/
  return new Date(`1970-01-01T${timeString}:00Z`);
}
