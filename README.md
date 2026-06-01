# NaMira Achados

Catálogo de produtos virais com links de afiliado (Shopee, Mercado Livre, Amazon, etc.).

## Documentação

- [Plano completo por fases](docs/plano-namira-achados.md)
- [Setup quando npm está bloqueado](docs/setup-sem-npm.md)

## Quick start (com rede para npm)

```bash
cp .env.example .env
# Preencher Supabase: DATABASE_URL, DIRECT_URL, chaves API

npm install
npx prisma db push
npm run db:seed
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) — Admin em [/admin](http://localhost:3000/admin).

## Supabase Storage

Criar buckets públicos: `store-logos`, `product-images`.
