"use client";

import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-1 px-5 py-5 text-sm text-muted-foreground sm:px-8">
        <p>{t.footer}</p>
        <p>{t.footerExtra}</p>
      </div>
    </footer>
  );
}
