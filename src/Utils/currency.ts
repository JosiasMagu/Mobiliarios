export const currency = (v: number) =>
  v.toLocaleString("pt-MZ", { style: "currency", currency: "MZN" });
