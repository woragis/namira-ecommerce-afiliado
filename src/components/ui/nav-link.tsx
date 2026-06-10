import Link from "next/link";
import type { ComponentProps } from "react";
import { LinkPendingIndicator } from "./link-pending-indicator";

type Props = ComponentProps<typeof Link> & {
  showPendingIndicator?: boolean;
};

export function NavLink({
  prefetch = true,
  showPendingIndicator = true,
  children,
  className = "",
  ...props
}: Props) {
  return (
    <Link prefetch={prefetch} className={className} {...props}>
      {children}
      {showPendingIndicator ? (
        <LinkPendingIndicator className="ml-1 align-middle" />
      ) : null}
    </Link>
  );
}
