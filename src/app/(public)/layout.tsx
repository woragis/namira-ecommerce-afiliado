import { Suspense } from "react";
import {
  PublicFooter,
  PublicHeader,
  PublicHeaderFallback,
} from "@/components/layout/public-shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<PublicHeaderFallback />}>
        <PublicHeader />
      </Suspense>
      <div className="flex-1">{children}</div>
      <Suspense fallback={null}>
        <PublicFooter />
      </Suspense>
    </>
  );
}
