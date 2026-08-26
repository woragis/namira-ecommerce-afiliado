import Image from "next/image";
import { NavLink } from "@/components/ui/nav-link";

type Props = {
  className?: string;
  variant?: "header" | "footer";
};

export function Logo({ className = "", variant = "header" }: Props) {
  const dark = variant === "footer";
  const size = dark ? 40 : 36;

  return (
    <NavLink
      href="/"
      className={`flex shrink-0 items-center gap-2 no-underline ${className}`}
    >
      <Image
        src={dark ? "/brand/footer.png" : "/brand/nav.png"}
        alt=""
        width={size}
        height={size}
        className="h-9 w-9 object-contain"
        priority={variant === "header"}
      />
      <span className="flex items-baseline gap-0.5">
        <span
          className={`font-display text-[22px] font-bold ${
            dark ? "text-white" : "text-[var(--roxo-escuro)]"
          }`}
        >
          Na
        </span>
        <span className="font-display text-[22px] font-black text-[var(--dourado)]">
          Mira
        </span>
        <span
          className={`logo-achados ml-1 text-[11px] font-medium tracking-[0.12em] uppercase ${
            dark ? "text-white/40" : "text-[var(--texto-suave)]"
          }`}
        >
          Achados
        </span>
      </span>
    </NavLink>
  );
}
