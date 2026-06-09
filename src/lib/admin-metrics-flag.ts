/** Métricas pesadas no admin ficam desligadas por padrão (performance). */
export function isAdminMetricsEnabled(): boolean {
  return process.env.ADMIN_METRICS_ENABLED === "true";
}
