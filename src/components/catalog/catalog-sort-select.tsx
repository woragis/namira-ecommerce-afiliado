"use client";

import { useRouter } from "next/navigation";

const sorts = [
  { value: "recentes", label: "Recentes" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "desconto", label: "Maior desconto" },
] as const;

type Props = {
  basePath: string;
  currentSort?: string;
  extraParams?: Record<string, string>;
};

export function CatalogSortSelect({
  basePath,
  currentSort = "recentes",
  extraParams = {},
}: Props) {
  const router = useRouter();

  function onChange(value: string) {
    const params = new URLSearchParams(extraParams);
    if (value && value !== "recentes") params.set("ordenar", value);
    else params.delete("ordenar");
    const q = params.toString();
    router.push(q ? `${basePath}?${q}` : basePath);
  }

  return (
    <label className="sm:hidden">
      <span className="sr-only">Ordenar</span>
      <select
        value={currentSort}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-[var(--borda)] bg-white px-3 py-1.5 text-xs text-[var(--texto)]"
      >
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
