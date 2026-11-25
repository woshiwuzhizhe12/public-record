"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BilibiliPlayer, Player, type PlayerHandle } from "@/components/player";
import { VideoCard } from "@/components/video-card";
import { bilibiliSpace, bilibiliUrl, relatedVideos, scopeFromLocation, scopeHome, type Video } from "@/data/catalogue";
import { formatDate, formatDuration } from "@/lib/format";
import { dateKindLabel, labelForTag, useI18n } from "@/lib/i18n";

export function VideoScreen({ video }: { video: Video }) {
  const { lang, t } = useI18n();
  const search = useSearchParams();
  const scope = scopeFromLocation({ person: search.get("person"), company: search.get("company"), video });
  const scopeKey = scope.kind === "company" ? scope.company.slug : scope.person.slug;
  const related = useMemo(
    () => (scope.kind === "company" ? relatedVideos(video, 3, undefined, scope.company.slug) : relatedVideos(video, 3, scope.person.slug)),
    [video, scope.kind, scopeKey],
  );
  const playerRef = useRef<PlayerHandle>(null);
  const [time, setTime] = useState(0);
  const [chapterQuery, setChapterQuery] = useState("");
  const [source, setSource] = useState<"youtube" | "bilibili">(lang === "zh" && video.bilibili ? "bilibili" : "youtube");
  const date = `${video.dateApproximate ? "≈ " : ""}${formatDate(video.date, lang)}`;
  const bilibili = video.bilibili;
  const playingBilibili = source === "bilibili" && bilibili != null;
  const activeChapters = playingBilibili ? bilibili.chapters : video.chapters;
  const watchUrl = playingBilibili ? bilibiliUrl(bilibili.bvid) : `https://www.youtube.com/watch?v=${video.id}`;
  const watchLabel = playingBilibili ? t.watchOnBilibili : t.watchOn;
  const activeChannel = playingBilibili ? bilibili.channel : video.channel;
  const activeChannelUrl = playingBilibili ? bilibiliSpace(bilibili.mid) : video.channelUrl;
  const activeDuration = playingBilibili ? bilibili.durationSec : video.durationSec;

  useEffect(() => {
    setSource(lang === "zh" && video.bilibili ? "bilibili" : "youtube");
    setTime(0);
    setChapterQuery("");
  }, [lang, video.id, video.bilibili]);

  const chapters = useMemo(() => {
    const needle = chapterQuery.trim().toLowerCase();
    if (!needle) return activeChapters;
    return activeChapters.filter((chapter) => chapter.title.toLowerCase().includes(needle));
  }, [chapterQuery, activeChapters]);

  const activeStart = [...activeChapters].reverse().find((chapter) => chapter.start <= time + 0.4)?.start;
  const chapterIntro = playingBilibili
    ? bilibili.chapterOrigin === "view_points"
      ? t.bilibiliChaptersPlayer
      : t.bilibiliChaptersDesc
    : t.chapterNote;

  return (
    <article className="mx-auto max-w-[1120px] px-5 py-6 sm:px-8 sm:py-8">
      <Link href={scopeHome(scope)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        {t.allVideos}
      </Link>
      <h1 className="mt-4 max-w-[22ch] text-4xl leading-[0.98] font-black tracking-[-0.04em] sm:text-5xl lg:text-[3.4rem]">
        {video.title}
      </h1>
      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <span className="text-foreground">{date}</span>
        <a href={watchUrl} target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">
          {watchLabel} ↗
        </a>
        <span>{formatDuration(activeDuration)}</span>
        <span>{t.formats[video.format] ?? video.format}</span>
        <a href={activeChannelUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
          {activeChannel}
        </a>
        {activeChapters.length > 0 ? (
          <span className="rounded border border-foreground/25 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-foreground uppercase">
            {t.chapters}
          </span>
        ) : null}
      </p>

      {playingBilibili ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{bilibili.title}</p>
      ) : null}
      {bilibili ? (
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label={t.sourceSwitch}>
          <SourceButton
            active={!playingBilibili}
            onClick={() => {
              setSource("youtube");
              setTime(0);
            }}
          >
            YouTube · {video.channel}
          </SourceButton>
          <SourceButton
            active={playingBilibili}
            onClick={() => {
              setSource("bilibili");
              setTime(0);
            }}
          >
            {t.bilibili} · {bilibili.channel}
          </SourceButton>
        </div>
      ) : null}
      {lang === "zh" && !playingBilibili ? (
        <p className="mt-4 rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm leading-6 text-foreground">{t.vpn}</p>
      ) : null}

      <div className="mt-5">
        {playingBilibili ? (
          <BilibiliPlayer key={bilibili.bvid} ref={playerRef} bvid={bilibili.bvid} title={bilibili.title} onTime={setTime} />
        ) : (
          <Player ref={playerRef} youtubeId={video.id} title={video.title} durationSec={video.durationSec} onTime={setTime} />
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <h2 className="text-2xl font-black tracking-[-0.03em]">{t.chapters}</h2>
          {activeChapters.length > 0 ? (
            <>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{chapterIntro}</p>
              <Input
                value={chapterQuery}
                onChange={(event) => setChapterQuery(event.target.value)}
                placeholder={t.chapterSearch}
                aria-label={t.chapterSearch}
                className="mt-4 h-11 rounded-lg"
              />
              {chapters.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">{t.noChapterMatch}</p>
              ) : (
                <ol className="mt-3 divide-y divide-border border-y border-border">
                  {chapters.map((chapter) => {
                    const active = chapter.start === activeStart;
                    return (
                      <li key={chapter.start}>
                        <button
                          type="button"
                          onClick={() => playerRef.current?.seek(chapter.start)}
                          className={`flex w-full gap-4 px-2 py-3 text-left text-sm hover:bg-muted ${active ? "bg-muted" : ""}`}
                        >
                          <span className="w-14 shrink-0 tabular-nums text-muted-foreground">{formatDuration(chapter.start)}</span>
                          <span className="font-medium text-foreground">{chapter.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          ) : (
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t.noChapters}</p>
          )}
        </section>

        <aside className="space-y-8">
          <div>
            <h2 className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{t.tags}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {video.tags
                .filter((tag) => tag.startsWith("topic:") || tag.startsWith("format:"))
                .map((tag) => (
                  <Link
                    key={tag}
                    href={`${scopeHome(scope)}&tags=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted"
                  >
                    {labelForTag(tag, t)}
                  </Link>
                ))}
            </div>
          </div>
          <div>
            <h2 className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{t.details}</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <Detail term={t.date}>
                <span className="block">{date}</span>
                <span className="text-muted-foreground">{dateKindLabel(video.dateKind, t)}</span>
              </Detail>
              <Detail term={t.source}>
                <a href={activeChannelUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {activeChannel}
                </a>
                <span className="text-muted-foreground"> · {playingBilibili ? t.bilibili : "YouTube"}</span>
              </Detail>
              <Detail term={t.status}>{playingBilibili ? t.reupload : video.sourceKind === "original" ? t.originalChannel : t.reupload}</Detail>
              <Detail term={t.runtime}>{formatDuration(activeDuration)}</Detail>
            </dl>
            {video.dateNote ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{video.dateNote[lang]}</p> : null}
            {video.uploadDate !== video.date ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {t.uploaded}: {formatDate(video.uploadDate, lang)}
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{t.moreLike}</h2>
          <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-3">
            {related.map((item) => (
              <VideoCard
                key={item.id}
                video={item}
                person={scope.kind === "person" ? scope.person.slug : undefined}
                company={scope.kind === "company" ? scope.company.slug : undefined}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function SourceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm ${active ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}
