type Props = {
  action: string;
  priceMin?: number;
  priceMax?: number;
  hiddenParams?: Record<string, string>;
};

export function PriceRangeFilter({
  action,
  priceMin,
  priceMax,
  hiddenParams = {},
}: Props) {
  return (
    <form
      action={action}
      method="get"
      className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--borda)] bg-white p-4"
    >
      {Object.entries(hiddenParams).map(([key, value]) =>
        value ? (
          <input key={key} type="hidden" name={key} value={value} />
        ) : null,
      )}
      <label className="text-sm">
        <span className="mb-1 block text-[var(--texto-suave)]">Preço mín. (R$)</span>
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
        <span className="mb-1 block text-[var(--texto-suave)]">Preço máx. (R$)</span>
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
        className="rounded-lg bg-[var(--roxo-escuro)] px-4 py-2 text-sm font-semibold text-white cursor-pointer"
      >
        Aplicar
      </button>
      {(priceMin != null || priceMax != null) && (
        <a
          href={action}
          className="py-2 text-sm text-[var(--texto-suave)] no-underline hover:text-[var(--roxo-escuro)]"
        >
          Limpar preço
        </a>
      )}
    </form>
  );
}
