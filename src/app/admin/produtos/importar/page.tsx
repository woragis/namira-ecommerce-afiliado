import Link from "next/link";
import { ImportCsvForm } from "@/components/admin/import-csv-form";

export default function ImportarProdutosPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/produtos" className="text-sm text-zinc-400 no-underline hover:text-white">
          ← Produtos
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-bold">Importar produtos (CSV)</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Envie uma planilha com links de afiliado. Ideal para cadastrar vários achados de uma vez.
      </p>
      <ImportCsvForm />
    </div>
  );
}
