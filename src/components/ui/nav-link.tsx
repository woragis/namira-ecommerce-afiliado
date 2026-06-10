import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

/** Link de navegação sem prefetch — evita dezenas de requests RSC + DB no layout. */
export function NavLink({ prefetch = false, ...props }: Props) {
  return <Link prefetch={prefetch} {...props} />;
}
