import { NavLink } from "@/components/ui/nav-link";
import type { Badge } from "@prisma/client";

type Props = {
  badges: Pick<Badge, "slug" | "label">[];
  activeSlug?: string;
  basePath?: string;
  extraParams?: Record<string, string>;
};

export function BadgeFilters({
  badges,
  activeSlug,
  basePath = "/produtos",
  extraParams = {},
}: Props) {
  if (badges.length === 0) return null;

  function href(slug: string | null) {
    const params = new URLSearchParams(extraParams);
    if (slug) params.set("badge", slug);
    else params.delete("badge");
    params.delete("page");
    const q = params.toString();
    return q ? `${basePath}?${q}` : basePath;
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <NavLink
        href={href(null)}
        className={`rounded-full px-3 py-1.5 text-xs font-medium no-underline ${
          !activeSlug
            ? "bg-[var(--roxo-escuro)] text-white"
            : "border border-[var(--borda)] bg-white text-[var(--texto-suave)]"
        }`}
      >
        Todos os selos
      </NavLink>
      {badges.map((b) => (
        <NavLink
          key={b.slug}
          href={href(b.slug)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium no-underline ${
            activeSlug === b.slug
              ? "bg-[var(--roxo-escuro)] text-white"
              : "border border-[var(--borda)] bg-white text-[var(--texto-suave)]"
          }`}
        >
          {b.label}
        </NavLink>
      ))}
    </div>
  );
}
