"use client";

import { useEffect, useRef } from "react";

export function ProductViewTracker({ productId }: { productId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        sourcePath: window.location.pathname,
      }),
      keepalive: true,
    });
  }, [productId]);

  return null;
}
