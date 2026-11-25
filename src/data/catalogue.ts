import raw from "./catalogue.json";
import { companies, companyBySlug, companySearchAliases, type Company } from "@/data/companies";
import { periodId } from "@/lib/format";
import type { Filterable } from "@/lib/filter";
import { videoHref, videoPeople } from "@/lib/membership";

export type Chapter = { start: number; title: string };
export type DateKind = "stream" | "upload" | "event";
export type ChapterOrigin = "view_points" | "description";

export type BilibiliSource = {
  bvid: string;
  title: string;
  channel: string;
  mid: number;
  durationSec: number;
  chapters: Chapter[];
  chapterOrigin: ChapterOrigin | null;
};

export type Person = {
  slug: string;
  name: string;
  nameZh: string;
  active: boolean;
  letter: { en: string; zh: string };
  headline: { en: string[]; zh: string[] };
  lede: { en: string; zh: string };
};

export type Video = Filterable & {
  person: string;
  people: string[];
  companies: string[];
  channelUrl: string;
  platform: "youtube";
  uploadDate: string;
  dateKind: DateKind;
  year: number;
  topics: string[];
  format: string;
  sourceKind: "original" | "reupload";
  dateNote: { en: string; zh: string } | null;
  chapters: Chapter[];
  verifiedOn: string;
  bilibili: BilibiliSource | null;
  extraSearch: string[];
};

type RawVideo = (typeof raw.videos)[number] & {
  bilibili?: BilibiliSource | null;
  people?: string[];
  companies?: string[];
};

const JRE_ALIASES = ["乔·罗根", "乔罗根", "Joe Rogan", "Rogan", "PowerfulJRE", "JRE"];

export function bilibiliUrl(bvid: string): string {
  return `https://www.bilibili.com/video/${bvid}`;
}

export function bilibiliSpace(mid: number): string {
  return `https://space.bilibili.com/${mid}`;
}

function decorate(entry: RawVideo): Video {
  const chapters = entry.chapters ?? [];
  const bilibili = entry.bilibili ?? null;
  const topics = entry.topics;
  const sourceKind = entry.sourceKind === "reupload" ? "reupload" : "original";
  const hasChapters = chapters.length > 0 || (bilibili?.chapters.length ?? 0) > 0;
  const tags = [
    ...topics.map((topic) => `topic:${topic}`),
    `format:${entry.format}`,
    `period:${periodId(entry.year)}`,
    "platform:youtube",
    ...(bilibili ? ["platform:bilibili"] : []),
    sourceKind === "original" ? "flag:original" : "flag:reupload",
    ...(hasChapters ? ["flag:chapters"] : []),
  ];
  const isJre = entry.channel === "PowerfulJRE" || /joe rogan experience/i.test(entry.title);
  const peopleOnVideo = videoPeople(entry);
  const companySlugs = (entry.companies ?? []).filter((slug) => companyBySlug(slug));
  const extraSearch = [
    ...(isJre ? JRE_ALIASES : []),
    ...(peopleOnVideo.includes("steve-jobs") ? ["乔布斯", "Steve Jobs"] : []),
    ...(peopleOnVideo.includes("lisa-su") ? ["苏姿丰", "苏资丰", "Lisa Su"] : []),
    ...companySlugs.flatMap((slug) => companySearchAliases[slug] ?? []),
    ...(bilibili ? [bilibili.title, bilibili.channel, ...bilibili.chapters.map((chapter) => chapter.title)] : []),
  ];
  return {
    id: entry.id,
    person: entry.person,
    people: peopleOnVideo,
    companies: companySlugs,
    title: entry.title,
    channel: entry.channel,
    channelUrl: entry.channelUrl,
    platform: "youtube",
    date: entry.date,
    uploadDate: entry.uploadDate,
    dateKind: entry.dateKind as DateKind,
    dateApproximate: entry.dateKind === "upload",
    year: entry.year,
    durationSec: entry.durationSec,
    topics,
    format: entry.format,
    sourceKind,
    dateNote: entry.dateNote,
    chapters,
    chapterTitles: [...chapters.map((chapter) => chapter.title), ...(bilibili?.chapters.map((chapter) => chapter.title) ?? [])],
    verifiedOn: entry.verifiedOn,
    tags,
    bilibili,
    extraSearch,
  };
}

export const people = raw.people as Person[];
export const verifiedOn = raw.verifiedOn;
export const videos: Video[] = (raw.videos as RawVideo[]).map(decorate);

export function activePeople(): Person[] {
  const listed = people.filter((person) => person.active);
  return listed.length > 0 ? listed : people;
}

export function defaultPerson(): Person {
  return activePeople()[0];
}

export function personFromQuery(value: string | null | undefined): Person {
  const found = activePeople().find((person) => person.slug === value);
  return found ?? defaultPerson();
}

export function personHome(slug: string): string {
  return `/?person=${encodeURIComponent(slug)}`;
}

export function personTimeline(slug: string): string {
  return `/timeline?person=${encodeURIComponent(slug)}`;
}

export function activeCompanies(): Company[] {
  return companies;
}

export function companyFromQuery(value: string | null | undefined): Company | undefined {
  return companyBySlug(value);
}

export function companyHome(slug: string): string {
  return `/?company=${encodeURIComponent(slug)}`;
}

export function companyTimeline(slug: string): string {
  return `/timeline?company=${encodeURIComponent(slug)}`;
}

export type BrowseScope =
  | { kind: "person"; person: Person }
  | { kind: "company"; company: Company };

export function scopeFromLocation(input: {
  person: string | null;
  company: string | null;
  video?: Video;
}): BrowseScope {
  const company = companyFromQuery(input.company);
  if (company && (!input.video || input.video.companies.includes(company.slug))) {
    return { kind: "company", company };
  }
  if (input.video && !people.some((person) => person.slug === input.video?.person)) {
    const fallback = companyFromQuery(input.video.companies[0]);
    if (fallback) return { kind: "company", company: fallback };
  }
  const requested = input.person;
  const slug = input.video
    ? requested && input.video.people.includes(requested)
      ? requested
      : input.video.person
    : requested;
  return { kind: "person", person: personFromQuery(slug) };
}

export function scopeHome(scope: BrowseScope): string {
  return scope.kind === "company" ? companyHome(scope.company.slug) : personHome(scope.person.slug);
}

export function scopeTimeline(scope: BrowseScope): string {
  return scope.kind === "company" ? companyTimeline(scope.company.slug) : personTimeline(scope.person.slug);
}

export function scopeVideoHref(id: string, scope: BrowseScope): string {
  return scope.kind === "company" ? videoHref(id, { company: scope.company.slug }) : videoHref(id, scope.person.slug);
}

export function switchScopeHref(to: "person" | "company", current: BrowseScope, video?: Video): string {
  if (to === "company") {
    const slug = current.kind === "company" ? current.company.slug : (video?.companies[0] ?? "spacex");
    if (video && video.companies.includes(slug)) return videoHref(video.id, { company: slug });
    return companyHome(slug);
  }
  const slug =
    current.kind === "person"
      ? current.person.slug
      : video && people.some((person) => person.slug === video.person)
        ? video.person
        : defaultPerson().slug;
  if (video && video.people.includes(slug)) return videoHref(video.id, slug);
  return personHome(slug);
}

export function activePerson(): Person {
  return defaultPerson();
}

export function videosFor(personSlug: string): Video[] {
  return videos.filter((video) => video.people.includes(personSlug));
}

export function videosForCompany(companySlug: string): Video[] {
  return videos.filter((video) => video.companies.includes(companySlug));
}

export function getVideo(id: string): Video | undefined {
  return videos.find((video) => video.id === id);
}

export function relatedVideos(video: Video, limit = 3, contextSlug?: string, companySlug?: string): Video[] {
  const personScope = contextSlug && video.people.includes(contextSlug) ? contextSlug : video.person;
  return videos
    .filter((candidate) => {
      if (candidate.id === video.id) return false;
      if (companySlug) return candidate.companies.includes(companySlug);
      return Boolean(personScope) && candidate.people.includes(personScope);
    })
    .map((candidate) => ({
      candidate,
      score:
        candidate.topics.filter((topic) => video.topics.includes(topic)).length * 2 +
        (candidate.format === video.format ? 1 : 0),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || b.candidate.date.localeCompare(a.candidate.date) || a.candidate.title.localeCompare(b.candidate.title),
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function catalogueStats(list: Video[]) {
  const seconds = list.reduce((sum, video) => sum + video.durationSec, 0);
  const years = list.map((video) => video.year);
  return {
    count: list.length,
    hours: Math.round(seconds / 3600),
    chapters: list.filter((video) => video.chapters.length > 0).length,
    yearStart: Math.min(...years),
    yearEnd: Math.max(...years),
  };
}
