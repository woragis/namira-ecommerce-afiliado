"use client";

import { useState } from "react";
import { createStore, updateStore } from "@/actions/admin/stores";
import { SubmitButton } from "@/components/ui/submit-button";
import { StorageUpload } from "./storage-upload";
import type { Store } from "@prisma/client";

type Props = { store?: Store };

export function StoreForm({ store }: Props) {
  const action = store ? updateStore.bind(null, store.id) : createStore;
  const [logoUrl, setLogoUrl] = useState(store?.logoUrl ?? "");
  const [logoStoragePath, setLogoStoragePath] = useState(
    store?.logoStoragePath ?? "",
  );

  return (
    <form action={action} className="max-w-lg space-y-4">
      <Field label="Nome" name="name" defaultValue={store?.name} required />
      <Field label="Slug" name="slug" defaultValue={store?.slug} placeholder="shopee" />
      <Field
        label="Label curto"
        name="shortLabel"
        defaultValue={store?.shortLabel ?? "S"}
        maxLength={4}
        required
      />
      <Field
        label="Cor primária"
        name="colorPrimary"
        type="color"
        defaultValue={store?.colorPrimary ?? "#7F77DD"}
        required
      />
      <Field
        label="Cor secundária (fundo filtro)"
        name="colorSecondary"
        type="color"
        defaultValue={store?.colorSecondary ?? "#EEEDFE"}
      />
      <Field
        label="Cor do texto no badge"
        name="colorOnPrimary"
        type="color"
        defaultValue={store?.colorOnPrimary ?? "#ffffff"}
        required
      />

      <StorageUpload
        bucket="storeLogos"
        folder={store?.slug ?? "nova-loja"}
        label="Upload logo (PNG/SVG)"
        onUploaded={(url, path) => {
          setLogoUrl(url);
          setLogoStoragePath(path);
        }}
      />
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <input type="hidden" name="logoStoragePath" value={logoStoragePath} />
      <Field
        label="URL do logo (ou cole manualmente)"
        name="logoUrlDisplay"
        defaultValue={logoUrl}
        onChange={(v) => setLogoUrl(v)}
      />

      <Field
        label="Ordem"
        name="sortOrder"
        type="number"
        defaultValue={String(store?.sortOrder ?? 0)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="showInNav" defaultChecked={store?.showInNav ?? true} />
        Mostrar na navegação
      </label>
      {store ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={store.isActive} />
          Ativa
        </label>
      ) : null}

      {store ? (
        <div className="rounded-lg border border-zinc-700 p-3">
          <p className="mb-2 text-xs text-zinc-400">Preview filtro ativo</p>
          <span
            className="inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium"
            style={{
              borderColor: store.colorPrimary,
              color: store.colorPrimary,
              backgroundColor: store.colorSecondary ?? "transparent",
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-5 w-5 object-contain" />
            ) : (
              store.shortLabel
            )}{" "}
            {store.name}
          </span>
        </div>
      ) : null}

      <SubmitButton
        pendingLabel="Salvando…"
        className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950 cursor-pointer"
      >
        Salvar
      </SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  maxLength,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  onChange?: (v: string) => void;
}) {
  if (name === "logoUrlDisplay") {
    return (
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">{label}</span>
        <input
          type="url"
          value={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>
    );
  }

  return (
    <label className="block text-sm">
      <span className="mb-1 block text-zinc-400">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
      />
    </label>
  );
}
