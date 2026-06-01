# Setup quando a rede bloqueia npm

O código do projeto está pronto para instalar dependências assim que você tiver acesso ao registry.

## Opções para instalar pacotes

1. **Outra rede** — hotspot do celular, casa, café.
2. **VPN** — se a rede corporativa bloqueia `registry.npmjs.org`.
3. **Máquina com acesso** — na outra máquina: `npm install`, zipar `node_modules` + `package-lock.json` e copiar (mesmo SO/arquitetura: Windows x64).
4. **Registry espelho** (se disponível na sua rede):
   ```bash
   npm config set registry https://registry.npmmirror.com
   npm install
   ```

## Após conseguir `npm install`

```bash
cd namira
cp .env.example .env
# Preencher DATABASE_URL, DIRECT_URL e chaves Supabase

npm install
npx prisma generate
npx prisma db push   # ou: npm run db:migrate
npm run db:seed
npm run dev
```

## Supabase (Storage)

No dashboard Supabase → Storage, criar buckets públicos:

- `store-logos`
- `product-images`

## Variáveis obrigatórias

Ver `.env.example`. Sem `DATABASE_URL` as páginas públicas mostram estado vazio amigável (sem crash).
