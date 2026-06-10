import { Prisma } from "@prisma/client";

/**
 * Evita crash quando DATABASE_URL não está configurado ou o schema ainda não foi aplicado.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

const UNAVAILABLE_CODES = new Set([
  "P2021", // tabela não existe
  "P2024", // timeout no pool de conexões
  "P1001", // não conecta ao servidor
  "P1000", // auth falhou
  "P1017", // conexão fechada
]);

export function isPrismaUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (UNAVAILABLE_CODES.has(error.code)) return true;
    if (error.code === "P2021" || error.code === "P2022") return true;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("can't reach database") ||
      msg.includes("does not exist") ||
      msg.includes("relation") ||
      msg.includes("prepared statement") ||
      msg.includes("connection") ||
      msg.includes("pool") ||
      msg.includes("timed out") ||
      msg.includes("server has closed")
    ) {
      return true;
    }
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    UNAVAILABLE_CODES.has((error as { code: string }).code)
  );
}

/** Executa query Prisma; em falha de schema/conexão retorna fallback (útil no build SSG). */
export async function safeDbQuery<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return await fn();
  } catch (error) {
    if (isPrismaUnavailableError(error)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[safe-db] Usando fallback:", error);
      }
      return fallback;
    }
    throw error;
  }
}
