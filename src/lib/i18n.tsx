"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { periodLabel } from "@/lib/format";

export type Lang = "en" | "zh";

const copy = {
  en: {
    wordmark: "不破不立",
    unofficial: "Unofficial",
    people: "People",
    companies: "Companies",
    videos: "Videos",
    personSwitch: "Person",
    timeline: "Timeline",
    about: "About",
    dark: "Dark",
    light: "Light",
    language: "EN",
    languageName: "English",
    searchPlaceholder: "Search titles, channels and chapters",
    filters: "Filters",
    surprise: "Surprise me",
    newest: "Newest",
    oldest: "Oldest",
    longest: "Longest",
    sort: "Sort",
    topic: "Topic",
    format: "Format",
    period: "Period",
    platform: "Platform",
    filterHelp: "Pick several tags to find videos matching all of them. Counts follow your search.",
    clearAll: "clear all",
    videosCount: (n: number) => `${n} ${n === 1 ? "video" : "videos"}`,
    hoursCount: (n: number) => `${n} ${n === 1 ? "hour" : "hours"}`,
    chaptersCount: (n: number) => `${n} ${n === 1 ? "chaptered" : "chaptered"}`,
    chaptersStat: "with chapters",
    noResults: "No videos match these filters.",
    reset: "Clear filters",
    allVideos: "All videos",
    watchOn: "Watch on YouTube",
    watchOnBilibili: "Watch on Bilibili",
    sourceSwitch: "Source",
    bilibili: "Bilibili",
    bilibiliSeekNote: "Choosing a chapter restarts the Bilibili player at that time. This page cannot scrub inside the embed.",
    bilibiliChaptersPlayer: "These chapters are the uploader’s markers on this Bilibili video.",
    bilibiliChaptersDesc: "These chapters are timestamps written in this Bilibili upload’s description.",
    chapters: "Chapters",
    chapterNote: "Headings taken from the publisher’s description. Not a word-for-word transcript.",
    chapterSearch: "Search these chapters",
    noChapterMatch: "No chapter headings match.",
    noChapters:
      "This starter file does not include a transcript for this video. Captions, when the uploader provides them, stay on YouTube.",
    moreLike: "More like this",
    tags: "Tags",
    details: "Details",
    date: "Date",
    source: "Source",
    status: "Status",
    runtime: "Runtime",
    streamed: "Streamed",
    uploaded: "Uploaded",
    event: "Event",
    originalChannel: "Original channel",
    reupload: "Re-upload",
    withChapters: "With chapters",
    vpn: "This YouTube embed may need a VPN to play in mainland China.",
    playerError: "This upload could not be embedded.",
    latest: "Latest",
    calloutTitle: "An unofficial file",
    calloutBody:
      "不破不立 is not affiliated with {name} or with the channels in this list. It is a viewing index: searchable, dated, and attributed. The files themselves stay with their owners.",
    calloutAction: "How this file is built",
    footer: "Unofficial file. Videos belong to their respective owners.",
    footerExtra: "Not affiliated with the people in these files, or with the channels listed.",
    timelineTitle: "Timeline",
    timelineLede: "The same file, ordered by the year used on each card.",
    notFound: "That video is not in this file.",
    backHome: "Back to the file",
    play: "Play",
    pause: "Pause",
    mute: "Mute",
    unmute: "Unmute",
    captions: "Captions",
    speed: "Playback speed",
    fullscreen: "Fullscreen",
    seek: "Seek",
    close: "Close",
    showMore: "Show more",
    topics: {
      tesla: "Tesla",
      spacex: "SpaceX & Starlink",
      ai: "AI",
      nvidia: "NVIDIA",
      cuda: "CUDA",
      gtc: "GTC",
      x: "X / Twitter",
      neuralink: "Neuralink",
      boring: "Boring Company",
      politics: "Politics",
      energy: "Energy & climate",
      society: "Society & civilization",
      apple: "Apple",
      amd: "AMD",
    } as Record<string, string>,
    formats: {
      interview: "Interview",
      podcast: "Podcast",
      conference: "Conference & forum",
      keynote: "Keynote & presentation",
      launch: "Launch",
      earnings: "Earnings & meetings",
      "white-house": "White House",
      tv: "TV appearance",
    } as Record<string, string>,
    aboutTitle: "About",
    aboutIntro:
      "不破不立 is an unofficial index of public appearances. The open files follow Elon Musk, Jensen Huang, Joe Rogan, Steve Jobs, and Lisa Su. Rogan's file is the full-length Joe Rogan Experience and JRE MMA shows posted on his official YouTube channel. Episodes with Musk or Huang also stay on the guest's file. Company files are separate and list official uploads from that company's own channel. The first companies are SpaceX, Tesla, NVIDIA, AMD, and Apple.",
    aboutSections: [
      {
        title: "How it is built",
        paragraphs: [
          "Each entry was checked against the live YouTube page on {date}. The title, channel, date and duration come from that check. This site does not copy another archive’s code, logo or database, and it does not re-host video files. The player embeds the original upload, and the channel is named beside every title.",
          "From mainland China, a YouTube embed may need a VPN before it will play.",
        ],
      },
      {
        title: "Dates",
        paragraphs: [
          "A plain date is the day YouTube marks as a livestream or premiere, or an event day the publisher states in the description. A date with “≈” is an upload date. Two news segments keep the year printed in their titles for the timeline; the note on those pages explains the gap.",
        ],
      },
      {
        title: "Chapters",
        paragraphs: [
          "Where a publisher put timestamps in the description, those headings show up here and can move the player. They are section titles, not a transcript. This starter file does not invent quotations and does not store full captions. Word-for-word text stays on YouTube.",
        ],
      },
      {
        title: "Another person",
        paragraphs: [
          "The catalogue is a list of people plus a list of videos. A video can name more than one person, which is how a Joe Rogan episode stays on both his file and the guest's. The left rail lists the initials of people already in the file. In English the letter is the first letter of the display name. In 简体中文 it is the pinyin initial used on this site: 马斯克 is M, 黄仁勋 is H, 乔·罗根 and 乔布斯 are Q, 苏姿丰 is S. Another person is a new entry in that list.",
        ],
      },
      {
        title: "Limits",
        paragraphs: [
          "The file is a sample, not a complete record. Tags are editorial and can miss a subject. A video can vanish from the player if its owner removes it or turns embedding off.",
        ],
      },
    ],
  },
  zh: {
    wordmark: "不破不立",
    unofficial: "非官方",
    people: "人物",
    companies: "公司",
    videos: "视频",
    personSwitch: "人物",
    timeline: "时间线",
    about: "关于",
    dark: "深色",
    light: "浅色",
    language: "中文",
    languageName: "简体中文",
    searchPlaceholder: "搜索标题、频道与章节",
    filters: "筛选",
    surprise: "随机一条",
    newest: "最新",
    oldest: "最早",
    longest: "最长",
    sort: "排序",
    topic: "主题",
    format: "形式",
    period: "时期",
    platform: "平台",
    filterHelp: "可多选标签，结果须同时符合全部所选标签。数量会跟着搜索一起变。",
    clearAll: "清除全部",
    videosCount: (n: number) => `${n} 条视频`,
    hoursCount: (n: number) => `${n} 小时`,
    chaptersCount: (n: number) => `${n} 条含章节`,
    chaptersStat: "含章节",
    noResults: "没有符合这些条件的视频。",
    reset: "清除筛选",
    allVideos: "全部视频",
    watchOn: "在 YouTube 上观看",
    watchOnBilibili: "在哔哩哔哩上观看",
    sourceSwitch: "来源",
    bilibili: "哔哩哔哩",
    bilibiliSeekNote: "点一条章节会从那个时间重新打开哔哩哔哩播放器。这个页面不能直接拖动嵌入画面里的进度。",
    bilibiliChaptersPlayer: "这些章节是该哔哩哔哩投稿自带的章节标记。",
    bilibiliChaptersDesc: "这些章节是该哔哩哔哩投稿简介里写下的时间戳。",
    chapters: "章节",
    chapterNote: "章节标题来自发布者自己的简介，不是逐字文字稿。",
    chapterSearch: "搜索这些章节",
    noChapterMatch: "没有匹配的章节。",
    noChapters: "这份起步档案没有收录该视频的文字稿。若上传者提供了字幕，仍在 YouTube 上。",
    moreLike: "更多类似",
    tags: "标签",
    details: "详情",
    date: "日期",
    source: "来源",
    status: "状态",
    runtime: "时长",
    streamed: "直播",
    uploaded: "上传",
    event: "活动当天",
    originalChannel: "原频道",
    reupload: "转载",
    withChapters: "有章节",
    vpn: "本视频来自 YouTube，在中国大陆可能需要 VPN 才能播放。",
    playerError: "这条视频无法嵌入播放。",
    latest: "最新",
    calloutTitle: "一份非官方档案",
    calloutBody:
      "不破不立与{name}以及名单里的频道都没有关联。这是一份可检索、标明日期和出处的观看索引。影像文件仍归各自权利人所有。",
    calloutAction: "这份档案如何做成",
    footer: "非官方档案。视频版权归各自权利人所有。",
    footerExtra: "与档案中的人物及所列频道均无关联。",
    timelineTitle: "时间线",
    timelineLede: "同一份档案，按卡片上使用的年份排列。",
    notFound: "这份档案里没有这条视频。",
    backHome: "返回档案",
    play: "播放",
    pause: "暂停",
    mute: "静音",
    unmute: "取消静音",
    captions: "字幕",
    speed: "播放速度",
    fullscreen: "全屏",
    seek: "进度",
    close: "关闭",
    showMore: "继续显示",
    topics: {
      tesla: "特斯拉",
      spacex: "SpaceX 与星链",
      ai: "人工智能",
      nvidia: "英伟达",
      cuda: "CUDA",
      gtc: "GTC",
      x: "X / 推特",
      neuralink: "Neuralink",
      boring: "无聊公司",
      politics: "政治",
      energy: "能源与气候",
      society: "社会与文明",
      apple: "苹果",
      amd: "AMD",
    } as Record<string, string>,
    formats: {
      interview: "访谈",
      podcast: "播客",
      conference: "会议与论坛",
      keynote: "主题演讲",
      launch: "发射",
      earnings: "财报与股东会",
      "white-house": "白宫",
      tv: "电视出演",
    } as Record<string, string>,
    aboutTitle: "关于",
    aboutIntro:
      "不破不立是一份非官方的公开出场索引。目前的档案跟随埃隆·马斯克、黄仁勋、乔·罗根、乔布斯和苏姿丰。乔·罗根这份收录他官方 YouTube 频道上的完整 Joe Rogan Experience 和 JRE MMA 节目。与马斯克或黄仁勋的那几期，也仍留在嘉宾自己的档案里。公司档案是分开的，只收录该公司自己频道上的官方上传。最先列入的是太空探索技术公司、特斯拉、英伟达、超威和苹果。",
    aboutSections: [
      {
        title: "如何做成",
        paragraphs: [
          "每条记录都在 {date} 对照 YouTube 页面核对过。标题、频道、日期和时长来自这次核对。本站不复制其他档案的代码、标志或数据库，也不转存视频文件。播放器嵌入的是原始上传，频道名写在每条标题旁边。",
          "在中国大陆，YouTube 嵌入播放器可能需要 VPN 才能播放。",
        ],
      },
      {
        title: "日期",
        paragraphs: [
          "不加符号的日期，是 YouTube 标明的直播或首播日，或发布者在简介里写明的活动日。带“≈”的是上传日期。有两条新闻片段在时间线上保留标题里印出的年份，页面上的说明写清了两者的差别。",
        ],
      },
      {
        title: "章节",
        paragraphs: [
          "如果发布者在简介里放了时间戳，那些标题会显示在这里，并可以跳转播放进度。它们是章节名，不是文字稿。这份起步档案不编造引语，也不保存完整字幕。逐字内容仍在 YouTube 上。",
        ],
      },
      {
        title: "下一位人物",
        paragraphs: [
          "目录由人物列表和视频列表组成。一条视频可以同时属于多位人物，所以乔·罗根的一期节目会同时出现在他和嘉宾的档案里。左侧列出已收录人物的首字母。英文按显示名的首字母；简体中文按本站使用的拼音首字母：马斯克是 M，黄仁勋是 H，乔·罗根和乔布斯是 Q，苏姿丰是 S。再加一位公众人物，只要在列表里新增一条。",
        ],
      },
      {
        title: "限度",
        paragraphs: [
          "这是一份样本，不是完整记录。标签是编辑判断，可能漏掉某个主题。权利人若删除视频或关闭嵌入，播放器里就会看不到。",
        ],
      },
    ],
  },
} as const;

export type Copy = (typeof copy)["en"];

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("pr-lang");
    if (saved === "en" || saved === "zh") {
      setLangState(saved);
      return;
    }
    if (window.navigator.language.toLowerCase().startsWith("zh")) setLangState("zh");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        window.localStorage.setItem("pr-lang", next);
      },
      t: copy[lang] as Copy,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within LanguageProvider");
  return value;
}

export function labelForTag(tag: string, t: Copy): string {
  const [kind, value] = tag.split(":");
  if (kind === "topic") return t.topics[value] ?? value;
  if (kind === "format") return t.formats[value] ?? value;
  if (kind === "period") return periodLabel(value);
  if (tag === "platform:youtube") return "YouTube";
  if (tag === "platform:bilibili") return t.bilibili;
  if (tag === "flag:chapters") return t.withChapters;
  if (tag === "flag:original") return t.originalChannel;
  if (tag === "flag:reupload") return t.reupload;
  return tag;
}

export function dateKindLabel(kind: "stream" | "upload" | "event", t: Copy): string {
  if (kind === "stream") return t.streamed;
  if (kind === "event") return t.event;
  return t.uploaded;
}
