# Plano — Métricas de produto (NaMira)

Funil de afiliado: **impressão** → **visualização (PDP)** → **clique de saída**.

## Estado atual

| Evento | Nome técnico | Onde grava | Status |
|--------|--------------|------------|--------|
| Clique afiliado | `ClickEvent` | `/r/[id]` | ✅ Implementado |

## Fases

### Fase 0 — Documento

Este arquivo: escopo, nomenclatura e ordem de entrega.

### Fase 1 — Schema e biblioteca

- Modelos Prisma: `ProductViewEvent` (PDP), `ProductImpressionEvent` (card na listagem).
- `src/lib/analytics.ts`: `recordProductView`, `recordProductImpression`, `hashUserAgent`, `recordProductClick` (centralizado).
- Campos comuns: `productId`, timestamp, `sourcePath` / `listPath`, `userAgentHash` opcional.

### Fase 2 — Visualização de detalhe (PDP view)

- Registrar no servidor em `/produtos/[slug]` após carregar produto publicado.
- Não bloquear render se o insert falhar (`safeDbQuery`).

### Fase 3 — Impressões na listagem

- Componente cliente `ProductImpressionTracker` (Intersection Observer, 50% visível, uma vez por sessão/página).
- `POST /api/analytics/impression` (produto publicado, sem auth).
- Integrar em `ProductCard`.

### Fase 4 — Admin

- Página `/admin/metricas`: totais 7d/30d, top produtos, funil (impressões → PDP → cliques).
- Dashboard: cards de impressões, visualizações e cliques.
- Menu admin: "Métricas"; `/admin/cliques` redireciona para `/admin/metricas`.

### Fase 5 — Export e testes

- `GET /api/admin/export/metricas?days=30` (CSV unificado).
- Testes de integração: PDP view + impression API + redirect (clique).

## Nomenclatura (referência)

| PT (admin) | Inglês / código | Tabela |
|------------|-----------------|--------|
| Impressão | `product_impression` | `product_impression_events` |
| Visualização (detalhe) | `product_view` / PDP view | `product_view_events` |
| Clique afiliado | `outbound_click` | `click_events` |

## Métricas derivadas (futuro)

- CTR listagem → detalhe: `views / impressions`
- CTR detalhe → afiliado: `clicks / views`
- Rollup diário (`product_metrics_daily`) se volume crescer

## Privacidade

- Sem IP em texto claro; `userAgentHash` truncado (mesmo padrão dos cliques).
- Impressões: deduplicação por `sessionStorage` no cliente (MVP).
