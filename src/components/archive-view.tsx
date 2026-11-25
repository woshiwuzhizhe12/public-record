"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Play, Search, Shuffle, SlidersHorizontal, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Thumb, VideoCard } from "@/components/video-card";
import { catalogueStats, personFromQuery, videosFor, type Video } from "@/data/catalogue";
import { videoHref } from "@/lib/membership";
import {
  countForTag,
  filterVideos,
  FORMAT_ORDER,
  isSortKey,
  PERIOD_ORDER,
  PLATFORM_ORDER,
  sortVideos,
  TOPIC_ORDER,
  type SortKey,
} from "@/lib/filter";
import { formatDate, formatDuration } from "@/lib/format";
import { labelForTag, useI18n } from "@/lib/i18n";
import { cn } from "cn";

export function ArchiveView() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const person = personFromQuery(search.get("person"));
  const catalogue = useMemo(() => videosFor(person.slug), [person.slug]);
  const stats = useMemo(() => catalogueStats(catalogue), [catalogue]);

  const qParam = search.get("q") ?? "";
  const sort: SortKey = isSortKey(search.get("sort")) ? (search.get("sort") as SortKey) : "newest";
  const selected = useMemo(
    () => (search.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    [search],
  );

  const [q, setQ] = useState(qParam);
  const [filtersOpen, setFiltersOpen] = useState(selected.length > 0);
  const [shown, setShown] = useState(60);
  const searchRef = useRef<HTMLInputElement>(null);
  const paramsRef = useRef(search);
  paramsRef.current = search;

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(paramsRef.current.toString());
      mutate(params);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    if (q === qParam) return;
    const handle = window.setTimeout(() => {
      updateParams((params) => {
        if (q.trim()) params.set("q", q);
        else params.delete("q");
      });
    }, 160);
    return () => window.clearTimeout(handle);
  }, [q, qParam, updateParams]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => sortVideos(filterVideos(catalogue, q, selected), sort), [catalogue, q, selected, sort]);
  useEffect(() => {
    setShown(60);
  }, [q, selected, sort, person.slug]);
  const showFeatured = sort === "newest" && q.trim() === "" && selected.length === 0 && results.length > 0;
  const featured = showFeatured ? results[0] : undefined;
  const grid = featured ? results.slice(1) : results;
  const filtering = q.trim() !== "" || selected.length > 0 || sort !== "newest";

  const groups = useMemo(() => {
    const present = new Set(catalogue.flatMap((video) => video.tags));
    return [
      { id: "topic", label: t.topic, tags: TOPIC_ORDER.map((id) => `topic:${id}`).filter((tag) => present.has(tag)) },
      { id: "format", label: t.format, tags: FORMAT_ORDER.map((id) => `format:${id}`).filter((tag) => present.has(tag)) },
      { id: "period", label: t.period, tags: PERIOD_ORDER.map((id) => `period:${id}`).filter((tag) => present.has(tag)) },
      { id: "platform", label: t.platform, tags: PLATFORM_ORDER.filter((tag) => present.has(tag)) },
    ];
  }, [catalogue, t]);

  function toggleTag(tag: string) {
    const next = selected.includes(tag) ? selected.filter((item) => item !== tag) : [...selected, tag];
    updateParams((params) => {
      if (next.length) params.set("tags", next.join(","));
      else params.delete("tags");
    });
  }

  function clearTags() {
    updateParams((params) => params.delete("tags"));
  }

  function setSort(next: SortKey) {
    updateParams((params) => {
      if (next === "newest") params.delete("sort");
      else params.set("sort", next);
    });
  }

  function surprise() {
    if (results.length === 0) return;
    const pick = results[Math.floor(Math.random() * results.length)];
    router.push(videoHref(pick.id, person.slug));
  }

  const headline = person.headline[lang];
  const sortLabel = sort === "oldest" ? t.oldest : sort === "longest" ? t.longest : t.newest;

  return (
    <div>
      <section className="mx-auto max-w-[1120px] px-5 pt-10 sm:px-8 sm:pt-14">
        <h1 className="max-w-[18ch] text-[2.7rem] leading-[0.92] font-black tracking-[-0.045em] text-balance sm:text-7xl lg:text-[5.6rem]">
          {headline[0]}
          <br />
          {headline[1]}
        </h1>
        <p className="mt-6 max-w-[46rem] text-[15px] leading-7 text-muted-foreground sm:text-base">{person.lede[lang]}</p>
        <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Stat n={stats.count} label={lang === "zh" ? "条视频" : stats.count === 1 ? "video" : "videos"} />
          <Stat n={stats.hours} label={lang === "zh" ? "小时" : stats.hours === 1 ? "hour" : "hours"} />
          <Stat n={stats.chapters} label={t.chaptersStat} />
          <span className="font-semibold text-foreground">
            {stats.yearStart}–{stats.yearEnd}
          </span>
        </p>

        <section className="mt-8 rounded-2xl border border-[#ffc3ca] bg-[#fff6f7] px-5 py-5 sm:px-6 dark:border-[#ff5c6c]/50 dark:bg-[#241114]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-black tracking-[-0.03em]">{t.calloutTitle}</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {t.calloutBody.replaceAll("{name}", lang === "zh" ? person.nameZh : person.name)}
              </p>
            </div>
            <Link
              href="/about"
              className={cn(buttonVariants({ size: "lg" }), "h-11 w-full shrink-0 rounded-full bg-[#c43244] px-5 text-white hover:bg-[#a82838] sm:w-auto")}
            >
              {t.calloutAction}
            </Link>
          </div>
        </section>
      </section>

      <div className="sticky top-0 z-30 mt-8 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1120px] px-5 py-3 sm:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className="h-12 rounded-full border-border bg-muted pr-16 pl-11 text-base"
              />
              {q ? (
                <button
                  type="button"
                  className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-background"
                  onClick={() => setQ("")}
                  aria-label={t.close}
                >
                  <X className="size-4" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted-foreground">(/)</kbd>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filtersOpen || selected.length > 0 ? "default" : "outline"}
                className="h-12 rounded-full px-4"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <SlidersHorizontal className="size-4" />
                {t.filters}
                {selected.length > 0 ? <span className="tabular-nums">{selected.length}</span> : null}
              </Button>
              <Button variant="outline" className="h-12 rounded-full px-4" onClick={surprise} disabled={results.length === 0}>
                <Shuffle className="size-4" />
                {t.surprise}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-12 items-center gap-1 rounded-full border border-border bg-background px-4 text-sm font-medium outline-none hover:bg-muted">
                  {sortLabel}
                  <ChevronDown className="size-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSort("newest")}>{t.newest}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("oldest")}>{t.oldest}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("longest")}>{t.longest}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filtersOpen ? (
            <div className="space-y-4 pt-4 pb-2">
              <p className="text-sm text-muted-foreground">{t.filterHelp}</p>
              {groups.map((group) => (
                <div key={group.id} className="grid gap-2 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-x-4">
                  <div className="pt-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{group.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => {
                      const active = selected.includes(tag);
                      const count = countForTag(catalogue, tag, q, selected);
                      return (
                        <button
                          key={tag}
                          type="button"
                          aria-pressed={active}
                          disabled={!active && count === 0}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                            active
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-background text-foreground hover:bg-muted",
                          )}
                        >
                          {labelForTag(tag, t)}
                          <span className={cn("tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-5 py-7 sm:px-8">
        {featured ? <Featured video={featured} person={person.slug} /> : null}
        {filtering ? (
          <div className="mb-6 flex flex-wrap items-center gap-2" aria-live="polite">
            <span className="mr-1 text-lg font-semibold">{t.videosCount(results.length)}</span>
            {selected.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-sm text-background"
              >
                {labelForTag(tag, t)}
                <X className="size-3.5" />
                <span className="sr-only">{t.close}</span>
              </button>
            ))}
            {selected.length > 0 ? (
              <button type="button" onClick={clearTags} className="text-sm text-foreground underline underline-offset-4">
                {t.clearAll}
              </button>
            ) : null}
          </div>
        ) : null}

        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-muted-foreground">{t.noResults}</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => {
                setQ("");
                updateParams((params) => {
                  params.delete("q");
                  params.delete("tags");
                });
              }}
            >
              {t.reset}
            </Button>
          </div>
        ) : (
          <div className={cn("grid grid-cols-1 gap-x-5 gap-y-9 md:grid-cols-2 min-[1100px]:grid-cols-3", featured && "mt-10")}>
            {grid.slice(0, shown).map((video) => (
              <VideoCard key={video.id} video={video} person={person.slug} />
            ))}
          </div>
        )}
        {grid.length > shown ? (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" className="rounded-full px-5" onClick={() => setShown((count) => count + 60)}>
              {t.showMore} ({grid.length - shown})
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <span>
      <span className="font-semibold text-foreground">{n}</span> <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function Featured({ video, person }: { video: Video; person: string }) {
  const { lang, t } = useI18n();
  const kind = t.formats[video.format] ?? video.format;
  return (
    <Link href={videoHref(video.id, person)} className="group grid items-center gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
        <Thumb key={video.id} id={video.id} className="h-full w-full object-cover" />
        <span className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-black shadow-lg">
          <Play className="ml-1 size-7 fill-current" />
        </span>
      </div>
      <div>
        <div className="flex items-center gap-3">
          <span className="rounded-sm border border-foreground/70 px-2 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
            {t.latest} {kind}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <h2 className="mt-4 text-4xl leading-[0.95] font-black tracking-[-0.04em] group-hover:underline sm:text-5xl lg:text-[3.4rem]">
          {video.title}
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          {video.dateApproximate ? "≈ " : ""}
          {formatDate(video.date, lang)} · {formatDuration(video.durationSec)} · {video.channel}
        </p>
      </div>
    </Link>
  );
}
