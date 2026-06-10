# NaMira — Plano de melhorias UI/UX

Documento de referência para implementação incremental. Cada fase pode virar um PR separado.

---

## Fase 1 — Correções críticas de navegação (Admin)

**Objetivo:** eliminar confusão do botão “voltar” e orientar o operador dentro do painel.

| # | Item | Problema | Solução proposta |
|---|------|----------|------------------|
| 1.1 | Link do sidebar | `← NaMira Achados` parece “voltar”, mas vai para `/` (loja) | Renomear para **“Ver loja pública ↗”** com ícone de link externo; mover para rodapé do sidebar |
| 1.2 | Breadcrumbs nas edições | `/admin/produtos/[id]`, `/admin/lojas/[id]`, etc. não têm trilha | Padrão: `Dashboard › Produtos › Editar` + link `← Produtos` no topo |
| 1.3 | Highlight do menu | Sub-rotas (`/admin/produtos/novo`) não destacam “Produtos” | Ativar item quando `pathname.startsWith(href)` |
| 1.4 | Novo produto | Sem link de retorno | Adicionar `← Produtos` como em Importar CSV |

**Arquivos principais:** `admin-shell.tsx`, páginas `[id]/page.tsx`, `produtos/novo/page.tsx`

---

## Fase 2 — Correções críticas (E-commerce público)

**Objetivo:** mensagens amigáveis e rotas consistentes.

| # | Item | Problema | Solução proposta |
|---|------|----------|------------------|
| 2.1 | Página de erro | Texto menciona “conexão com o banco” | Mensagem genérica: “Não foi possível carregar. Tente novamente.” |
| 2.2 | Favoritos | Copy diz “em breve” mas o coração já funciona | Atualizar texto do estado vazio |
| 2.3 | URLs de categoria | Nav usa `/produtos?categoria=x`, footer usa `/categorias/x` | Unificar para uma rota canônica |
| 2.4 | 404 | Só oferece “Ver catálogo” | Adicionar “Ir para home” |

**Arquivos principais:** `(public)/error.tsx`, `favoritos-client.tsx`, `store-filter-nav.tsx`, `footer.tsx`, `not-found.tsx`

---

## Fase 3 — Feedback e segurança (Admin)

**Objetivo:** operador entende o que aconteceu após cada ação.

| # | Item | Problema | Solução proposta |
|---|------|----------|------------------|
| 3.1 | Formulários | Erros de validação invisíveis; sucesso só via redirect | `useActionState` + toast ou banner de erro/sucesso |
| 3.2 | Desativar loja/categoria | Sem confirmação | Modal como no delete de produto |
| 3.3 | Toggles na listagem | Publicado/Destaque são textos pequenos | Switches visuais ou ícones com tooltip |
| 3.4 | Export CSV | Parece link genérico | Label “Baixar CSV” + ícone download |
| 3.5 | Erro admin | Fala de `prisma db push` | Duas mensagens: operador vs. dev (colapsável) |

**Arquivos principais:** `product-form.tsx`, actions em `products.ts`, `lojas/page.tsx`, `categorias/page.tsx`

---

## Fase 4 — Mobile e performance percebida

**Objetivo:** loja usável no celular; admin acessível em telas pequenas.

| # | Item | Problema | Solução proposta |
|---|------|----------|------------------|
| 4.1 | Header mobile | Favoritos e “Ver lojas” ocultos (`hidden sm:flex`) | Menu hamburger ou bottom nav |
| 4.2 | Admin sidebar | Largura fixa `w-56`, sem collapse | Drawer responsivo + botão menu |
| 4.3 | Loading público | Spinner genérico em toda navegação | Skeleton de grid/cards |
| 4.4 | Detalhe produto | CTA some ao rolar | Barra fixa inferior no mobile (“Comprar na {loja}”) |
| 4.5 | Nav superior | Muitos itens em scroll horizontal | Agrupar categorias em “Mais” ou chips colapsáveis |

**Arquivos principais:** `header.tsx`, `admin-shell.tsx`, `loading.tsx`, `produtos/[slug]/page.tsx`

---

## Fase 5 — Polish visual e micro-UX

**Objetivo:** refinamentos de baixo risco.

| # | Item | Problema | Solução proposta |
|---|------|----------|------------------|
| 5.1 | Product card | Badge “Destaque” sobrepõe outros badges | Posições distintas (ex.: destaque top-right) |
| 5.2 | Product card | `<a>` dentro de `<a>` (WhatsApp dentro do link do card) | Botões overlay fora do NavLink (já parcialmente necessário por a11y) |
| 5.3 | Dashboard métricas off | Instrução técnica de env var | Texto para operador + detalhe técnico opcional |
| 5.4 | Busca vazia | Redireciona para `/produtos` em vez de `/busca` | Comportamento documentado ou unificado |
| 5.5 | Formulário produto | `max-w-lg` estreito para galeria | Layout em duas colunas no desktop |

---

## Padrões de navegação (referência)

```
ADMIN
├── Sidebar: só rotas /admin/*
├── Topo do conteúdo: breadcrumb hierárquico
├── Rodapé sidebar: “Ver loja pública ↗” (saída do admin)
└── ← reservado para voltar ao nível pai DENTRO do admin

LOJA
├── Logo → home
├── Breadcrumb em páginas profundas (produto, categoria, loja)
└── Erros → linguagem de consumidor, nunca infraestrutura
```

---

## Ordem sugerida de implementação

1. **Fase 1** — maior impacto imediato no admin (1–2 PRs)
2. **Fase 2** — quick wins no público
3. **Fase 5.2** — nested links (a11y + hydration)
4. **Fase 3** — qualidade operacional
5. **Fase 4** — mobile
6. **Fase 5** — restante do polish

---

*Gerado a partir da auditoria UI/UX de mar/2026.*
