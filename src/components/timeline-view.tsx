"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { scopeFromLocation, scopeVideoHref, videosFor, videosForCompany } from "@/data/catalogue";
import { formatDate, formatDuration } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

export function TimelineView() {
  return (
    <Suspense fallback={null}>
      <TimelineBody />
    </Suspense>
  );
}

function TimelineBody() {
  const { lang, t } = useI18n();
  const search = useSearchParams();
  const scope = scopeFromLocation({ person: search.get("person"), company: search.get("company") });
  const list = scope.kind === "company" ? videosForCompany(scope.company.slug) : videosFor(scope.person.slug);
  const years = [...new Set(list.map((video) => video.year))].sort((a, b) => b - a);

  return (
    <article className="mx-auto max-w-[1120px] px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-5xl font-black tracking-[-0.045em] sm:text-6xl">{t.timelineTitle}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{t.timelineLede}</p>
      <div className="mt-10 space-y-10">
        {years.map((year) => {
          const rows = list
            .filter((video) => video.year === year)
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
          return (
            <section key={year}>
              <h2 className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground">{year}</h2>
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {rows.map((video) => (
                  <li key={video.id}>
                    <Link href={scopeVideoHref(video.id, scope)} className="grid gap-1 py-3 sm:grid-cols-[140px_120px_minmax(0,1fr)_72px] sm:items-baseline sm:gap-4">
                      <span className="text-sm text-muted-foreground">
                        {video.dateApproximate ? "≈ " : ""}
                        {formatDate(video.date, lang)}
                      </span>
                      <span className="text-sm text-muted-foreground">{t.formats[video.format] ?? video.format}</span>
                      <span>
                        <span className="font-semibold tracking-[-0.02em]">{video.title}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{video.channel}</span>
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums sm:text-right">{formatDuration(video.durationSec)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </article>
  );
}
