# Plano — Dashboard admin detalhado (NaMira)

Evolução de `/admin` (resumo do dia) e `/admin/metricas` (análise).

## Estado atual

- Dashboard: contadores de inventário + 3 métricas fixas (7d).
- Métricas: totais 7d/30d, top 10, CTRs, últimos cliques, export CSV.

## Fases

### Fase 0 — Documento

Este arquivo.

### Fase A — Período e KPIs com comparação

- Query `?days=7|30|90` em `/admin/metricas`.
- KPIs do período vs período anterior (mesma duração).
- `% de variação` em impressões, PDP e cliques.

### Fase B — Série temporal

- Gráfico de barras por dia (impressões, PDP, cliques).
- Agregação SQL por `DATE(...)`; dias sem evento = zero.

### Fase C — Funil e produtos

- Bloco visual do funil com CTRs entre etapas.
- Tabela de produtos: loja, link editar admin, badge “sem clique” (muitas impressões, 0 cliques).

### Fase D — Recortes

- Top páginas (`listPath` das impressões).
- Top lojas por cliques no período.

### Fase E — Dashboard home

- Seção “Performance (7d)” com mini-funil e atalho para métricas.
- Bloco “Saúde do catálogo”: publicados sem clique, rascunhos, destaques fracos.

### Fase F — Futuro (fora deste ciclo)

- Rollup `product_metrics_daily` se volume > ~100k eventos/mês.
- Gráficos com biblioteca (Recharts) se CSS não bastar.
- Eventos: busca, share WhatsApp.

## Arquivos principais

- `src/lib/analytics-stats.ts` — queries agregadas
- `src/components/admin/metrics/*` — UI
- `src/app/admin/metricas/page.tsx` — página de análise
- `src/app/admin/page.tsx` — resumo executivo
