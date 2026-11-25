"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { videoHref } from "@/lib/membership";
import { formatDate, formatDuration } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { Video } from "@/data/catalogue";

export function VideoCard({ video, person }: { video: Video; person?: string }) {
  const { lang, t } = useI18n();
  const date = `${video.dateApproximate ? "≈ " : ""}${formatDate(video.date, lang)}`;
  const file = person && video.people.includes(person) ? person : video.person;
  return (
    <Link href={videoHref(video.id, file)} className="group block focus-visible:outline-none">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <Thumb key={video.id} id={video.id} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        <span className="absolute top-2 left-2 rounded bg-white/95 px-1.5 py-0.5 text-[11px] font-semibold text-black">
          {video.year}
        </span>
        <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white tabular-nums">
          {formatDuration(video.durationSec)}
        </span>
      </div>
      <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>{date}</span>
        <span>{t.formats[video.format] ?? video.format}</span>
        {video.chapters.length > 0 || (video.bilibili?.chapters.length ?? 0) > 0 ? (
          <span className="rounded border border-foreground/25 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-foreground uppercase">
            {t.chapters}
          </span>
        ) : null}
        {video.bilibili ? (
          <span className="rounded border border-foreground/25 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-foreground">
            {t.bilibili}
          </span>
        ) : null}
      </p>
      <h3 className="mt-1.5 text-[15px] leading-snug font-bold tracking-[-0.02em] group-hover:underline">
        {video.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {video.channel} · YouTube
      </p>
    </Link>
  );
}

export function Thumb({ id, className }: { id: string; className?: string }) {
  const max = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  const hq = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const [src, setSrc] = useState(max);
  useEffect(() => {
    setSrc(max);
  }, [max]);
  return (
    // Thumbnails are served by YouTube; the archive does not re-host them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={className}
      onLoad={(event) => {
        if (src === max && event.currentTarget.naturalWidth < 400) setSrc(hq);
      }}
      onError={() => {
        if (src !== hq) setSrc(hq);
      }}
    />
  );
}
