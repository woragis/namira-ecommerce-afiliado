import { redirect } from "next/navigation";
import { isAdminMetricsEnabled } from "@/lib/admin-metrics-flag";

export default function AdminCliquesRedirect() {
  redirect(isAdminMetricsEnabled() ? "/admin/metricas" : "/admin");
}
