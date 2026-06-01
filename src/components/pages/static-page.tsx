import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";

const fallbacks: Record<string, { title: string; body: string }> = {
  sobre: {
    title: "Sobre o projeto",
    body: "NaMira Achados é uma curadoria de produtos virais das maiores lojas do Brasil.",
  },
  "como-funciona": {
    title: "Como funciona",
    body: "Você navega, escolhe um produto e é redirecionado à loja parceira para comprar.",
  },
  contato: {
    title: "Contato",
    body: "Entre em contato pelo Instagram linkado no rodapé.",
  },
};

export async function StaticPage({ slug }: { slug: string }) {
  let title = fallbacks[slug]?.title ?? slug;
  let body = fallbacks[slug]?.body ?? "";

  if (isDatabaseConfigured()) {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (page?.isPublished) {
      title = page.title;
      body = page.body;
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:px-10">
      <h1 className="font-display mb-6 text-3xl font-bold text-[var(--roxo-mais-escuro)]">
        {title}
      </h1>
      <div className="prose prose-neutral leading-relaxed text-[var(--texto)]">
        {body.split("\n").map((p, i) => (
          <p key={i} className="mb-4">
            {p}
          </p>
        ))}
      </div>
    </main>
  );
}
