export default function converterParaSegundos(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/i);
  if (!match) {
    throw new Error(`Formato de expiração inválido: ${value}`);
  }

  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return num;
    case "m":
      return num * 60;
    case "h":
      return num * 60 * 60;
    case "d":
      return num * 60 * 60 * 24;
    default:
      throw new Error(`Unidade de tempo desconhecida: ${unit}`);
  }
}
