# Plano de implementação — NaMira Achados

Catálogo de afiliados em Next.js 16 + PostgreSQL (Supabase) + Storage (buckets Supabase). Sem auth para visitantes; painel admin protegível por secret.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| App | Next.js 16 (App Router), React 19, TypeScript |
| Estilo | Tailwind CSS v4, tokens do protótipo HTML |
| Banco | Supabase Postgres via Prisma |
| Storage | Buckets `store-logos`, `product-images` |
| Validação | Zod |
| Deploy | Vercel + Supabase |

---

## Fase 0 — Documentação e convenções

- [x] Este documento (`docs/plano-namira-achados.md`)
- Convenções: rotas em português, slugs kebab-case, commits por fase

---

## Fase 1 — Fundação do projeto

**Objetivo:** dependências, schema Prisma, variáveis de ambiente, clientes DB/Supabase.

- [x] Prisma schema (stores, categories, badges, products, collections, site_settings, pages, click_events)
- [x] `.env.example` com `DATABASE_URL`, Supabase URL/keys, buckets
- [x] Scripts: `db:generate`, `db:migrate`, `db:seed`, `db:studio`
- [x] `src/lib/db.ts`, `src/lib/supabase.ts`

**Commit:** `feat(fase-1): fundação prisma e clientes supabase`

---

## Fase 2 — Seed e camada de dados

**Objetivo:** dados iniciais espelhando o protótipo HTML.

- [x] Seed: 3 lojas (Shopee, ML, Amazon) com cores de marca
- [x] Categorias, badges, produtos exemplo, coleção "viral-agora"
- [x] `site_settings` e páginas estáticas
- [x] Queries reutilizáveis em `src/lib/catalog.ts`

**Commit:** `feat(fase-2): seed e queries do catálogo`

---

## Fase 3 — Design system e layout público

**Objetivo:** identidade visual do `namiraachados.html`.

- [x] CSS variables (roxo, dourado, tipografia Playfair + DM Sans)
- [x] Layout `(public)` com Header, Footer, StoreCategoryNav
- [x] Metadata e `lang="pt-BR"`

**Commit:** `feat(fase-3): design system e layout público`

---

## Fase 4 — Home e componentes de catálogo

**Objetivo:** página inicial dinâmica.

- [x] Hero com stats de `site_settings`
- [x] Store badges (lojas + contagem)
- [x] Banner viral / coleções na home
- [x] `ProductCard`, `ProductGrid`, filtros visuais com logo/cor da loja

**Commit:** `feat(fase-4): home e componentes de catálogo`

---

## Fase 5 — Listagens, filtros e detalhe

**Objetivo:** navegação completa do catálogo.

- [x] `/produtos` com query params (`loja`, `categoria`, `badge`, `ordenar`, paginação)
- [x] `/lojas`, `/lojas/[slug]`
- [x] `/categorias/[slug]`, `/colecoes/[slug]`
- [x] `/produtos/[slug]` detalhe + relacionados
- [x] `/busca?q=`
- [x] `/r/[id]` redirect afiliado + `click_events`

**Commit:** `feat(fase-5): listagens filtros e redirect afiliado`

---

## Fase 6 — Favoritos e páginas estáticas

**Objetivo:** UX complementar sem login.

- [x] `/favoritos` (localStorage + API resolve)
- [x] `/sobre`, `/como-funciona`, `/contato` via tabela `pages`
- [x] Sitemap e metadata por rota

**Commit:** `feat(fase-6): favoritos e páginas estáticas`

---

## Fase 7 — Admin: layout e CRUD de lojas

**Objetivo:** gerenciar marketplaces e branding.

- [x] Layout `/admin` com sidebar
- [x] CRUD lojas: nome, slug, cores, logo (URL Supabase `store-logos`)
- [x] Preview do chip de filtro ativo/inativo
- [x] Upload direto ao bucket (Fase 9)

**Commit:** `feat(fase-7): admin crud de lojas com upload de logo`

---

## Fase 8 — Admin: produtos, categorias e coleções

**Objetivo:** gerenciar catálogo e links de afiliado.

- [x] CRUD produtos básico (affiliate_url, preços, imagem URL, loja, publicar)
- [x] CRUD categorias
- [x] CRUD badges
- [x] CRUD coleções + produtos na coleção (com reordenar ↑↓)
- [x] Upload imagem em `product-images`

**Commit:** `feat(fase-8): admin produtos categorias e coleções`

---

## Fase 9 — Admin: configurações, páginas e analytics

**Objetivo:** conteúdo do site e métricas.

- [x] Editor `site_settings` (hero, header top, footer)
- [x] CRUD `pages`
- [x] Dashboard cliques (`click_events`)
- [x] Proteção admin: `ADMIN_SECRET` + cookie

**Commit:** `feat(fase-9): admin configurações páginas e analytics`

---

## Fase 10 — Polimento e produção

**Objetivo:** performance e SEO.

- [x] ISR/revalidate nas listagens (`revalidate = 60`)
- [x] `robots.txt`, `sitemap.xml`
- [x] Open Graph por produto
- [x] Página 404 e empty states
- [x] `docs/deploy-supabase.md`

**Commit:** `feat(fase-10): seo isr e documentação de deploy`

---

## Modelo de dados (resumo)

### `stores`
Marketplace: slug, name, shortLabel, logoUrl, logoStoragePath, colorPrimary, colorSecondary, colorOnPrimary, brandPalette (JSON), sortOrder, showInNav, isActive.

### `products`
title, slug, description, imageUrl, prices, affiliateUrl, storeId, isPublished, isFeatured, badges/categories N:N.

### `collections`
Seções home e banners; N:N com produtos ordenados.

### Buckets Supabase
- `store-logos` — PNG/SVG das marcas
- `product-images` — fotos dos produtos

---

## Rotas (mapa)

### Público
| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/produtos` | Catálogo + filtros |
| `/produtos/[slug]` | Detalhe |
| `/lojas` | Lista de lojas |
| `/lojas/[slug]` | Produtos da loja |
| `/categorias/[slug]` | Por categoria |
| `/colecoes/[slug]` | Curadoria |
| `/busca` | Busca |
| `/favoritos` | Favoritos (localStorage) |
| `/sobre`, `/como-funciona`, `/contato` | CMS |
| `/r/[id]` | Redirect afiliado |

### Admin
| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard |
| `/admin/lojas` | CRUD lojas |
| `/admin/produtos` | CRUD produtos |
| `/admin/categorias` | CRUD categorias |
| `/admin/colecoes` | CRUD coleções |
| `/admin/configuracoes` | Site settings |
| `/admin/paginas` | Páginas estáticas |
| `/admin/cliques` | Analytics |

---

## Variáveis de ambiente

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET=
```

---

## Ordem de execução

```
Fase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
```

Cada fase = um ou mais commits atômicos na branch principal do repositório `namira`.

---

## Fase 11 — Extras (pós-MVP)

- [x] Paginação em `/produtos`, `/lojas`, `/categorias`, `/busca`
- [x] Filtros por badge (selo) no catálogo
- [x] CRUD badges no admin (`/admin/badges`)
- [x] Reordenar produtos na coleção (↑↓)
- [x] `loading.tsx` e `error.tsx` no layout público

---

## Fase 12 — Importação, exportação e PWA

- [x] Importar produtos via CSV (`/admin/produtos/importar`)
- [x] Exportar produtos e cliques (CSV)
- [x] Busca e filtro por loja no admin de produtos
- [x] `manifest.ts` + ícone SVG (instalável no celular)
- [x] Open Graph global + link Instagram no rodapé
- [x] Template CSV em `public/templates/produtos-exemplo.csv`

**Commit:** `feat(fase-12): import export csv pwa e melhorias admin`
