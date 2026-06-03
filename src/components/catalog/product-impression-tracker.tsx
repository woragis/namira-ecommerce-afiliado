"use client";

import { useEffect, useRef } from "react";

type Props = {
  productId: string;
  children: React.ReactNode;
};

function sessionKey(productId: string, listPath: string) {
  return `namira-imp:${productId}:${listPath}`;
}

export function ProductImpressionTracker({ productId, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    const listPath = window.location.pathname;
    const key = sessionKey(productId, listPath);
    if (sessionStorage.getItem(key)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5);
        if (!visible) return;

        sessionStorage.setItem(key, "1");
        observer.disconnect();

        void fetch("/api/analytics/impression", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, listPath }),
          keepalive: true,
        });
      },
      { threshold: [0.5] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [productId]);

  return <div ref={ref}>{children}</div>;
}
