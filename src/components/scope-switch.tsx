"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getVideo, scopeFromLocation, switchScopeHref, type BrowseScope } from "@/data/catalogue";
import { useI18n } from "@/lib/i18n";
import { cn } from "cn";

export function ScopeSwitch() {
  return (
    <Suspense fallback={null}>
      <ScopeSwitchBar />
    </Suspense>
  );
}

function ScopeSwitchBar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { t } = useI18n();
  const videoId = pathname.startsWith("/v/") ? pathname.split("/")[2] : undefined;
  const video = videoId ? getVideo(videoId) : undefined;
  const scope: BrowseScope = scopeFromLocation({
    person: search.get("person"),
    company: search.get("company"),
    video,
  });

  return (
    <div className="border-b border-border">
      <div className="mx-auto flex max-w-[1120px] items-center px-5 py-2 sm:px-8">
        <div className="inline-flex rounded-full border border-border p-0.5 text-sm" role="group" aria-label={`${t.people} / ${t.companies}`}>
          <ModeLink href={switchScopeHref("person", scope, video)} active={scope.kind === "person"}>
            {t.people}
          </ModeLink>
          <ModeLink href={switchScopeHref("company", scope, video)} active={scope.kind === "company"}>
            {t.companies}
          </ModeLink>
        </div>
      </div>
    </div>
  );
}

function ModeLink({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-3.5 py-1 font-semibold",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
