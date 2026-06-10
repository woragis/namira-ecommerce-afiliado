"use client";

import { useState } from "react";

type Props = {
  url: string;
  className?: string;
};

export function CopyShareLinkButton({ url, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--borda)] bg-white px-5 py-3 text-sm font-semibold text-[var(--roxo-escuro)] cursor-pointer transition hover:border-[var(--roxo)] hover:bg-[var(--roxo-claro)] ${className}`}
    >
      {copied ? "Link copiado!" : "Copiar link curto"}
    </button>
  );
}
