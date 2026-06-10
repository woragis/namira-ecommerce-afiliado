const MARKETPLACE_SUFFIX =
  /\s*(?:Novo\s*\|\s*\+?\d[\d.]*\s*vendidos?|Mais vendido|Frete grátis)\s*$/i;

/** Remove sufixos típicos de marketplace e espaços extras. */
function stripMarketplaceNoise(text: string): string {
  let out = text.replace(/\s+/g, " ").trim();
  let prev = "";
  while (out !== prev) {
    prev = out;
    out = out.replace(MARKETPLACE_SUFFIX, "").trim();
  }
  return out;
}

/** Detecta título colado/repetido (ex.: "NomeNomeNome" ou "Nome Nome Nome"). */
function collapseRepeatedPhrase(text: string): string {
  const spaced = text.match(/^(.{12,120})(?:\s+\1)+$/);
  if (spaced?.[1]) return spaced[1].trim();

  for (let unitLen = Math.min(120, Math.floor(text.length / 2)); unitLen >= 12; unitLen--) {
    const unit = text.slice(0, unitLen);
    if (/^(.)\1+$/.test(unit)) continue;
    const nextIndex = text.indexOf(unit, 1);
    if (nextIndex > 0 && nextIndex <= unitLen + 1) {
      return unit.trim();
    }
  }

  return text;
}

function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trim()}…`;
}

/** Título legível para UI (deduplica repetições de scrape/import). */
export function displayProductTitle(raw: string, maxLength = 140): string {
  let text = stripMarketplaceNoise(raw);
  if (!text) return "Produto";

  text = collapseRepeatedPhrase(text);
  text = stripMarketplaceNoise(text);

  return truncateAtWord(text, maxLength);
}

/** Descrição: omitir se for igual ao título ou vazia após normalização. */
export function displayProductDescription(
  raw: string | null | undefined,
  title: string,
): string | null {
  if (!raw?.trim()) return null;
  const desc = stripMarketplaceNoise(raw);
  const cleanTitle = displayProductTitle(title, 500);
  const cleanDesc = displayProductTitle(desc, 500);
  if (!cleanDesc || cleanDesc === cleanTitle) return null;
  return truncateAtWord(desc, 600);
}
