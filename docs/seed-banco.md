# Seed do banco — modos seguros

## Comandos

| Comando | Uso |
|---------|-----|
| `npm run db:seed` | Igual a `db:seed:ensure` (produção / upgrades) |
| `npm run db:seed:ensure` | Cria só o que falta; não sobrescreve conteúdo |
| `npm run db:seed:demo` | Ensure + produtos/coleções demo |
| `npm run db:seed:upgrade` | Ensure + atualiza entidades do manifesto (slugs fixos) |

Todos usam `DIRECT_URL` quando definida (recomendado no Supabase).

## Modo `ensure` (padrão)

- Lojas, categorias, badges: cria se não existir; **não altera** se já existir.
- Settings e páginas: **só cria chaves/slugs ausentes**; nunca sobrescreve valor editado.
- Produtos demo: **não roda** (use `demo`).
- Coleções: cria shell; **não remove** vínculos existentes.
- Contadores `productCountCached`: recalculados (agregado seguro).
- Métricas (cliques, views, impressões): **nunca tocadas**.

## Modo `demo`

- Tudo do ensure + produtos de demonstração (slugs fixos em `DEMO_PRODUCT_SLUGS`).
- Vínculos produto↔categoria/badge: `skipDuplicates` (sem repetir).
- Coleções demo: preenche **só se vazia**; adiciona links faltantes sem apagar os seus.

## Modo `upgrade` (`--upgrade`)

Atualiza **apenas** entidades definidas no seed (slugs conhecidos):

- Lojas, categorias, badges, produtos demo, coleções, páginas.
- Settings: só atualiza valores se `ALLOW_DESTRUCTIVE_SEED=1` **e** `--upgrade`.

```bash
ALLOW_DESTRUCTIVE_SEED=1 npm run db:seed:upgrade
```

Com destructive: repopula membros da coleção `viral-agora` com produtos demo.

## Variáveis

| Variável | Efeito |
|----------|--------|
| `SEED_MODE` | `ensure` \| `demo` |
| `SEED_UPGRADE` | `1` / `true` ou flag `--upgrade` |
| `ALLOW_DESTRUCTIVE_SEED` | Permite reset da coleção viral e settings no upgrade |
| `DIRECT_URL` | Usada como `DATABASE_URL` no seed |

## Boas práticas

1. **Produção com dados reais:** `npm run db:seed:ensure`
2. **Banco novo / dev:** `npm run db:seed:demo`
3. **Novo campo no manifesto (lojas, categorias):** `npm run db:seed:upgrade`
4. **Nunca** rodar `ALLOW_DESTRUCTIVE_SEED` em produção sem backup.
