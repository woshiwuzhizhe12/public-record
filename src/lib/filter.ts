export type SortKey = "newest" | "oldest" | "longest";

export type Filterable = {
  id: string;
  title: string;
  channel: string;
  date: string;
  dateApproximate: boolean;
  durationSec: number;
  tags: string[];
  chapterTitles: string[];
  extraSearch?: string[];
};

export function matchesQuery(video: Filterable, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [video.title, video.channel, ...video.chapterTitles, ...(video.extraSearch ?? [])].join("\n").toLowerCase();
  return haystack.includes(needle);
}

export function matchesTags(video: Filterable, tags: string[]): boolean {
  if (tags.length === 0) return true;
  const owned = new Set(video.tags);
  return tags.every((tag) => owned.has(tag));
}

export function filterVideos<T extends Filterable>(videos: T[], query: string, tags: string[]): T[] {
  return videos.filter((video) => matchesQuery(video, query) && matchesTags(video, tags));
}

export function countForTag<T extends Filterable>(
  videos: T[],
  tag: string,
  query: string,
  selected: string[],
): number {
  const required = selected.includes(tag) ? selected : [...selected, tag];
  return filterVideos(videos, query, required).length;
}

export function sortVideos<T extends Filterable>(videos: T[], sort: SortKey): T[] {
  const copy = [...videos];
  copy.sort((a, b) => {
    if (sort === "longest") {
      return b.durationSec - a.durationSec || b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
    }
    if (sort === "oldest") {
      return a.date.localeCompare(b.date) || a.title.localeCompare(b.title);
    }
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    if (a.dateApproximate !== b.dateApproximate) return a.dateApproximate ? 1 : -1;
    return b.durationSec - a.durationSec || a.title.localeCompare(b.title);
  });
  return copy;
}

export function isSortKey(value: string | null): value is SortKey {
  return value === "newest" || value === "oldest" || value === "longest";
}

export const TOPIC_ORDER = [
  "tesla",
  "spacex",
  "nvidia",
  "ai",
  "cuda",
  "gtc",
  "x",
  "neuralink",
  "boring",
  "politics",
  "energy",
  "society",
  "apple",
  "amd",
];

export const FORMAT_ORDER = ["interview", "podcast", "conference", "keynote", "launch", "earnings", "white-house", "tv"];

export const PERIOD_ORDER = ["1980-1994", "1995-2009", "2010-2014", "2015-2019", "2020-2022", "2023", "2024", "2025", "2026"];

export const PLATFORM_ORDER = ["platform:youtube", "platform:bilibili", "flag:chapters", "flag:original", "flag:reupload"];
