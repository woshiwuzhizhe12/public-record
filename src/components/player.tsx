"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { Thumb } from "@/components/video-card";
import { cn } from "cn";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  setOption: (module: string, option: string, value: unknown) => void;
  getOption: (module: string, option: string) => { languageCode?: string } | null;
};

declare global {
  interface Window {
    YT?: { Player: new (element: HTMLElement, options: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type PlayerHandle = {
  seek: (seconds: number) => void;
};

const RATES = [0.75, 1, 1.25, 1.5, 2];

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      if (!document.querySelector("script[src*='youtube.com/iframe_api']")) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
    });
  }
  return apiPromise;
}

export const Player = forwardRef<PlayerHandle, { youtubeId: string; title: string; durationSec: number; onTime?: (seconds: number) => void }>(
  function Player({ youtubeId, title, durationSec, onTime }, ref) {
    const { t } = useI18n();
    const frameRef = useRef<HTMLDivElement>(null);
    const mountRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const pendingSeek = useRef<number | null>(null);
    const wantPlay = useRef(false);
    const onTimeRef = useRef(onTime);
    onTimeRef.current = onTime;

    const [hasPlayed, setHasPlayed] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(durationSec);
    const [muted, setMuted] = useState(false);
    const [rate, setRate] = useState(1);
    const [rateOpen, setRateOpen] = useState(false);
    const [captionsOn, setCaptionsOn] = useState(false);
    const [error, setError] = useState(false);

    useImperativeHandle(ref, () => ({
      seek(seconds: number) {
        wantPlay.current = true;
        setTime(seconds);
        onTimeRef.current?.(seconds);
        const player = playerRef.current;
        if (player) {
          player.seekTo(seconds, true);
          player.playVideo();
        } else {
          pendingSeek.current = seconds;
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;
      let player: YTPlayer | null = null;
      const host = mountRef.current;
      const node = document.createElement("div");
      node.className = "h-full w-full";
      host?.appendChild(node);

      loadYouTubeApi().then(() => {
        if (cancelled || !window.YT || !host) return;
        player = new window.YT.Player(node, {
          videoId: youtubeId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            disablekb: 1,
            origin: window.location.origin,
            cc_load_policy: 0,
          },
          events: {
            onReady: () => {
              if (cancelled || !player) return;
              playerRef.current = player;
              const reported = player.getDuration();
              if (reported > 0) setDuration(reported);
              if (pendingSeek.current != null) {
                player.seekTo(pendingSeek.current, true);
                pendingSeek.current = null;
              }
              if (wantPlay.current) player.playVideo();
            },
            onStateChange: (event: { data: number }) => {
              if (event.data === 1) {
                setPlaying(true);
                setHasPlayed(true);
                return;
              }
              if (event.data === 0 || event.data === 2) setPlaying(false);
            },
            onError: () => {
              if (!cancelled) setError(true);
            },
          },
        });
      });

      return () => {
        cancelled = true;
        playerRef.current = null;
        try {
          player?.destroy();
        } catch {
          /* The iframe may already be gone. */
        }
        node.remove();
      };
    }, [youtubeId]);

    useEffect(() => {
      if (!playing) return;
      const timer = window.setInterval(() => {
        const current = playerRef.current?.getCurrentTime?.() ?? 0;
        setTime(current);
        onTimeRef.current?.(current);
      }, 250);
      return () => window.clearInterval(timer);
    }, [playing]);

    function play() {
      wantPlay.current = true;
      playerRef.current?.playVideo();
    }

    function togglePlay() {
      if (playing) playerRef.current?.pauseVideo();
      else play();
    }

    function toggleMute() {
      const player = playerRef.current;
      if (!player) return;
      if (player.isMuted()) {
        player.unMute();
        setMuted(false);
      } else {
        player.mute();
        setMuted(true);
      }
    }

    function chooseRate(next: number) {
      setRate(next);
      playerRef.current?.setPlaybackRate(next);
      setRateOpen(false);
    }

    function toggleCaptions() {
      const player = playerRef.current;
      if (!player) return;
      try {
        if (captionsOn) {
          player.setOption("captions", "track", {});
          setCaptionsOn(false);
          return;
        }
        player.setOption("captions", "track", { languageCode: "en" });
        setCaptionsOn(true);
      } catch {
        setCaptionsOn(false);
      }
    }

    async function toggleFullscreen() {
      const node = frameRef.current;
      if (!node) return;
      if (document.fullscreenElement) await document.exitFullscreen();
      else await node.requestFullscreen();
    }

    return (
      <div ref={frameRef} className="overflow-hidden rounded-xl bg-black text-white">
        <div className="relative aspect-video">
          <div ref={mountRef} className={cn("absolute inset-0", (!hasPlayed || error) && "invisible")} />
          {!hasPlayed && !error ? (
            <button
              type="button"
              className="absolute inset-0 z-10"
              onClick={play}
              aria-label={t.play}
            >
              <Thumb key={youtubeId} id={youtubeId} className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-black/15" />
              <span className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-lg">
                <Play className="ml-1 size-8 fill-current" />
              </span>
            </button>
          ) : null}
          {error ? (
            <div className="absolute inset-0 z-20 bg-neutral-950">
              <Thumb key={`${youtubeId}-dim`} id={youtubeId} className="h-full w-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-black/70" />
              <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm">
                <p className="max-w-md">
                  {t.playerError}{" "}
                  <a className="underline" href={`https://www.youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noreferrer">
                    {t.watchOn}
                  </a>
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2 bg-black px-3 py-2 text-xs sm:gap-3 sm:text-sm">
          <Control label={playing ? t.pause : t.play} onClick={togglePlay}>
            {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
          </Control>
          <span className="shrink-0 tabular-nums text-white/90">
            {formatDuration(time)} / {formatDuration(duration)}
          </span>
          <input
            className="h-1 min-w-0 flex-1 cursor-pointer accent-white"
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={1}
            value={Math.min(time, duration)}
            aria-label={t.seek}
            aria-valuetext={`${formatDuration(time)} / ${formatDuration(duration)}`}
            onChange={(event) => {
              const next = Number(event.target.value);
              setTime(next);
              onTimeRef.current?.(next);
              playerRef.current?.seekTo(next, true);
            }}
          />
          <Control label={t.captions} pressed={captionsOn} onClick={toggleCaptions}>
            <span className="text-[11px] font-semibold tracking-wide">CC</span>
          </Control>
          <Control label={muted ? t.unmute : t.mute} onClick={toggleMute}>
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Control>
          <div className="relative">
            <Control label={t.speed} pressed={rateOpen} onClick={() => setRateOpen((open) => !open)}>
              <span className="tabular-nums">{rate}×</span>
            </Control>
            {rateOpen ? (
              <div className="absolute right-0 bottom-9 z-20 min-w-16 overflow-hidden rounded-md bg-neutral-900 py-1 shadow-lg ring-1 ring-white/10">
                {RATES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={cn("block w-full px-3 py-1 text-left hover:bg-white/10", value === rate && "font-semibold")}
                    onClick={() => chooseRate(value)}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <Control label={t.fullscreen} onClick={() => void toggleFullscreen()}>
            <Maximize className="size-4" />
          </Control>
          <span className="sr-only">{title}</span>
        </div>
      </div>
    );
  },
);

function Control({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "grid h-8 min-w-8 place-items-center rounded px-1.5 text-white hover:bg-white/10",
        pressed && "bg-white/15",
      )}
    >
      {children}
    </button>
  );
}

export const BilibiliPlayer = forwardRef<PlayerHandle, { bvid: string; title: string; onTime?: (seconds: number) => void }>(
  function BilibiliPlayer({ bvid, title, onTime }, ref) {
    const { t } = useI18n();
    const [start, setStart] = useState(0);
    const [playToken, setPlayToken] = useState(0);
    const onTimeRef = useRef(onTime);
    onTimeRef.current = onTime;

    useImperativeHandle(ref, () => ({
      seek(seconds: number) {
        const next = Math.max(0, Math.floor(seconds));
        setStart(next);
        setPlayToken((token) => token + 1);
        onTimeRef.current?.(next);
      },
    }));

    const src = `https://player.bilibili.com/player.html?isOutside=true&bvid=${encodeURIComponent(bvid)}&p=1&t=${start}&autoplay=${playToken > 0 ? 1 : 0}&high_quality=1&danmaku=0`;

    return (
      <div className="overflow-hidden rounded-xl bg-black text-white">
        <iframe
          key={`${bvid}-${playToken}-${start}`}
          title={title}
          src={src}
          className="aspect-video w-full"
          allow="fullscreen; autoplay"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
        <p className="px-3 py-2 text-xs leading-5 text-white/75">{t.bilibiliSeekNote}</p>
      </div>
    );
  },
);
