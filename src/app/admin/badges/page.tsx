import { permanentRedirect } from "next/navigation";

export default function AdminBadgesRedirect() {
  permanentRedirect("/admin/categorias");
}
