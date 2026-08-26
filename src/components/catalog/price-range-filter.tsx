type Props = {
  action: string;
  priceMin?: number;
  priceMax?: number;
  hiddenParams?: Record<string, string>;
  clearHref: string;
};

export function PriceRangeFilter({
  action,
  priceMin,
  priceMax,
  hiddenParams = {},
  clearHref,
}: Props) {
  const hasPrice = priceMin != null || priceMax != null;

  return (
    <details
      className="mb-6 rounded-2xl border border-[var(--borda)] bg-white"
      open={hasPrice || undefined}
    >
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[var(--roxo-escuro)]">
        Preço
        {hasPrice ? (
          <span className="ml-2 font-normal text-[var(--texto-suave)]">
            (filtro ativo)
          </span>
        ) : null}
      </summary>
      <form
        action={action}
        method="get"
        className="flex flex-wrap items-end gap-3 border-t border-[var(--borda)] px-4 py-3"
      >
        {Object.entries(hiddenParams).map(([key, value]) =>
          value ? (
            <input key={key} type="hidden" name={key} value={value} />
          ) : null,
        )}
        <label className="text-sm">
          <span className="mb-1 block text-[var(--texto-suave)]">Mín. (R$)</span>
          <input
            type="number"
            name="preco_min"
            min={0}
            step="0.01"
            defaultValue={priceMin ?? ""}
            placeholder="0"
            className="w-28 rounded-lg border border-[var(--borda)] bg-[var(--roxo-claro)] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--texto-suave)]">Máx. (R$)</span>
          <input
            type="number"
            name="preco_max"
            min={0}
            step="0.01"
            defaultValue={priceMax ?? ""}
            placeholder="500"
            className="w-28 rounded-lg border border-[var(--borda)] bg-[var(--roxo-claro)] px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-[var(--roxo-escuro)] px-4 py-2 text-sm font-semibold text-white"
        >
          Aplicar
        </button>
        {hasPrice ? (
          <a
            href={clearHref}
            className="py-2 text-sm text-[var(--texto-suave)] no-underline hover:text-[var(--roxo-escuro)]"
          >
            Limpar preço
          </a>
        ) : null}
      </form>
    </details>
  );
}
