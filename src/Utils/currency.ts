// Formata valores em Meticais como "12 000,00 MT"
export const currency = (v: number) =>
  `${new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(v) ? v : 0)} MT`;
