import { Suspense } from "react";
import { ArchiveView } from "@/components/archive-view";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1120px] px-5 py-16 text-sm text-muted-foreground">…</div>}>
      <ArchiveView />
    </Suspense>
  );
}
