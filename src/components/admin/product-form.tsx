"use client";

import { useState } from "react";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { slugify } from "@/lib/slugify";
import { legacyMediaPayload, mediaToDrafts } from "@/lib/product-media";
import { ProductMediaManager } from "./product-media-manager";
import type { Badge, Category, Product, ProductMedia, Store } from "@prisma/client";

type ProductWithRelations = Product & {
  categories: { categoryId: string }[];
  badges: { badgeId: string }[];
  media?: ProductMedia[];
};

type Props = {
  stores: Store[];
  categories: Category[];
  badges: Badge[];
  product?: ProductWithRelations;
};

function initialMedia(product?: ProductWithRelations) {
  if (product?.media?.length) return mediaToDrafts(product.media);
  return legacyMediaPayload(product?.imageUrl, product?.imageStoragePath);
}

export function ProductForm({ stores, categories, badges, product }: Props) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!product);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManual) setSlug(slugify(value));
  }

  const selectedCategories = new Set(
    product?.categories.map((c) => c.categoryId) ?? [],
  );
  const selectedBadges = new Set(product?.badges.map((b) => b.badgeId) ?? []);

  return (
    <form action={action} className="max-w-lg space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">Título</span>
        <input
          name="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">
          Slug{" "}
          <span className="text-zinc-600">
            {slugManual ? "(editado manualmente)" : "(gerado do título)"}
          </span>
        </span>
        <input
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlugManual(true);
            setSlug(e.target.value);
          }}
          placeholder="produto-exemplo"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">Loja</span>
        <select
          name="storeId"
          required
          defaultValue={product?.storeId ?? stores[0]?.id}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <Field
        label="Link de afiliado"
        name="affiliateUrl"
        type="url"
        defaultValue={product?.affiliateUrl}
        required
      />
      <Field
        label="Preço atual (R$)"
        name="priceCurrent"
        type="number"
        step="0.01"
        defaultValue={product ? String(product.priceCurrent) : ""}
        required
      />
      <Field
        label="Preço original (opcional)"
        name="priceOriginal"
        type="number"
        step="0.01"
        defaultValue={
          product?.priceOriginal ? String(product.priceOriginal) : ""
        }
      />
      <Field
        label="Descrição"
        name="description"
        defaultValue={product?.description ?? ""}
      />

      <ProductMediaManager
        folder={slug || "novo-produto"}
        initial={initialMedia(product)}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm text-zinc-400">Categorias</legend>
        {categories.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="categoryIds"
              value={c.id}
              defaultChecked={selectedCategories.has(c.id)}
            />
            {c.icon} {c.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm text-zinc-400">Badges</legend>
        {badges.map((b) => (
          <label key={b.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="badgeIds"
              value={b.id}
              defaultChecked={selectedBadges.has(b.id)}
            />
            {b.label}
          </label>
        ))}
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={product?.isPublished ?? true}
        />
        Publicado (visível na loja)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={product?.isFeatured}
        />
        Destaque na home
      </label>

      <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950">
        Salvar
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-zinc-400">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        step={step}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
      />
    </label>
  );
}
