/** Datas relativas para queries admin (fora de componentes React). */
export function daysAgo(days: number, now = Date.now()): Date {
  return new Date(now - days * 24 * 60 * 60 * 1000);
}
