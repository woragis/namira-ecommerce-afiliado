"use client";

import { useLinkStatus } from "next/link";

type Props = {
  className?: string;
};

export function LinkPendingIndicator({ className = "" }: Props) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`link-hint inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current ${pending ? "is-pending" : ""} ${className}`}
    />
  );
}
