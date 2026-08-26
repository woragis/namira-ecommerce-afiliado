import { permanentRedirect } from "next/navigation";

export default function AdminBadgeEditRedirect() {
  permanentRedirect("/admin/categorias");
}
