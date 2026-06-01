"use client";

import { useState } from "react";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { StorageUpload } from "./storage-upload";
import type { Badge, Category, Product, Store } from "@prisma/client";

type ProductWithRelations = Product & {
  categories: { categoryId: string }[];
  badges: { badgeId: string }[];
};

type Props = {
  stores: Store[];
  categories: Category[];
  badges: Badge[];
  product?: ProductWithRelations;
};

export function ProductForm({ stores, categories, badges, product }: Props) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [imageStoragePath, setImageStoragePath] = useState(
    product?.imageStoragePath ?? "",
  );

  const selectedCategories = new Set(
    product?.categories.map((c) => c.categoryId) ?? [],
  );
  const selectedBadges = new Set(product?.badges.map((b) => b.badgeId) ?? []);

  return (
    <form action={action} className="max-w-lg space-y-4">
      <Field label="Título" name="title" defaultValue={product?.title} required />
      <Field label="Slug" name="slug" defaultValue={product?.slug} />

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

      <StorageUpload
        bucket="productImages"
        folder={product?.slug ?? "novo-produto"}
        label="Upload imagem do produto"
        onUploaded={(url, path) => {
          setImageUrl(url);
          setImageStoragePath(path);
        }}
      />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="imageStoragePath" value={imageStoragePath} />
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">URL da imagem</span>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>

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
          defaultChecked={product?.isPublished}
        />
        Publicado
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
