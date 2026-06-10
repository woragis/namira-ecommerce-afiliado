"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavigationPendingContextValue = {
  pending: boolean;
  start: () => void;
  stop: () => void;
};

const NavigationPendingContext =
  createContext<NavigationPendingContextValue | null>(null);

function NavigationProgressBar({ active }: { active: boolean }) {
  return (
    <div
      className="navigation-progress pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden"
      aria-hidden={!active}
      role="progressbar"
      aria-busy={active}
    >
      <div
        className={`navigation-progress-bar h-full bg-[var(--roxo)] ${active ? "is-active" : ""}`}
      />
    </div>
  );
}

function NavigationPendingEffects({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  const start = useCallback(() => setPending(true), []);
  const stop = useCallback(() => setPending(false), []);

  useEffect(() => {
    stop();
  }, [pathname, searchParams, stop]);

  useEffect(() => {
    function shouldStartNavigation(anchor: HTMLAnchorElement, event: MouseEvent) {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return false;
      if (anchor.target === "_blank") return false;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        const samePath =
          url.pathname === window.location.pathname &&
          url.search === window.location.search;
        return !samePath;
      } catch {
        return false;
      }
    }

    function handleClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldStartNavigation(anchor, event)) return;
      start();
    }

    function handleSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.getAttribute("data-no-nav-progress") === "true") return;
      start();
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, [start]);

  return (
    <NavigationPendingContext.Provider value={{ pending, start, stop }}>
      <NavigationProgressBar active={pending} />
      {children}
    </NavigationPendingContext.Provider>
  );
}

export function NavigationPendingProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <NavigationPendingEffects>{children}</NavigationPendingEffects>;
}

export function useNavigationPending() {
  const ctx = useContext(NavigationPendingContext);
  if (!ctx) {
    return { pending: false, start: () => {}, stop: () => {} };
  }
  return ctx;
}
