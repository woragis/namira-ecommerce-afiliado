# Deploy — NaMira + Supabase

## 1. Projeto Supabase

1. Criar projeto em [supabase.com](https://supabase.com).
2. **Database** → Connection string:
   - `DATABASE_URL` — pooler (porta 6543, `?pgbouncer=true`)
   - `DIRECT_URL` — conexão direta (porta 5432) para migrations

## 2. Storage (buckets públicos)

| Bucket | Uso |
|--------|-----|
| `store-logos` | PNG/SVG das lojas |
| `product-images` | Fotos dos produtos |

Em cada bucket: **Public bucket** = ON.

Política mínima (SQL Editor) — leitura pública:

```sql
-- Leitura pública dos assets
CREATE POLICY "Public read store logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-logos');

CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

Upload pelo admin usa `SUPABASE_SERVICE_ROLE_KEY` no servidor (não expor no client).

## 3. Variáveis (.env)

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET=sua-senha-forte
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

## 4. Banco local → produção

```bash
npm install
npx prisma db push
npm run db:seed
```

## 5. Vercel

- Importar repositório `namira`
- Adicionar todas as env vars
- Build command: `npm run build` (já roda `prisma generate`)

## 6. Admin

- Acesse `/admin/login`
- Se `ADMIN_SECRET` estiver vazio, o painel fica aberto (apenas dev)
- Em produção, **sempre** defina `ADMIN_SECRET`
