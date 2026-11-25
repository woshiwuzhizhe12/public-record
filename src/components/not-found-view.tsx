"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "cn";

export function NotFoundView() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-[680px] px-5 py-24 sm:px-8">
      <h1 className="text-4xl font-black tracking-[-0.04em]">{t.notFound}</h1>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-6 rounded-full")}>
        {t.backHome}
      </Link>
    </div>
  );
}
