import { NavLink } from "@/components/ui/nav-link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <NavLink href="/" className={`flex shrink-0 items-baseline gap-0.5 no-underline ${className}`}>
      <span className="font-display text-[22px] font-bold text-[var(--roxo-escuro)]">
        Na
      </span>
      <span className="font-display text-[22px] font-black text-[var(--dourado)]">
        Mira
      </span>
      <span className="ml-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--texto-suave)]">
        Achados
      </span>
    </NavLink>
  );
}
