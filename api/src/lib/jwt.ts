// src/lib/jwt.ts
export function getJwtSecret(): string {
  // use SEMPRE a mesma env key e o mesmo default
  const s = process.env.JWT_SECRET?.trim();
  return s && s.length >= 12 ? s : "devsecret"; // default único
}
