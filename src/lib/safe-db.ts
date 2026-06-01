/**
 * Evita crash quando DATABASE_URL não está configurado (ex.: antes do npm install / seed).
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
