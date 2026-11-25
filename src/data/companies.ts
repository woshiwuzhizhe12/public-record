export type Company = {
  slug: string;
  name: string;
  nameZh: string;
  letter: { en: string; zh: string };
  mark: { en: string; zh: string };
  headline: { en: string[]; zh: string[] };
  lede: { en: string; zh: string };
};

export const companies: Company[] = [
  {
    slug: "amd",
    name: "AMD",
    nameZh: "超威",
    letter: { en: "A", zh: "C" },
    mark: { en: "AMD", zh: "超" },
    headline: { en: ["AMD,", "the open file."], zh: ["超威，", "一份公开档案。"] },
    lede: {
      en: "CES, Computex, and Advancing AI keynotes from the AMD channel, plus one fireside chat AMD posted itself. Those recordings also stay on Lisa Su’s file. Interviews published by other channels stay on her file only.",
      zh: "AMD 频道上的 CES、Computex 和 Advancing AI 主题演讲，以及 AMD 自己发布的一场对谈。这些也仍留在苏姿丰的档案里。其他频道发布的访谈只留在她的档案中。",
    },
  },
  {
    slug: "apple",
    name: "Apple",
    nameZh: "苹果",
    letter: { en: "A", zh: "P" },
    mark: { en: "A", zh: "苹" },
    headline: { en: ["Apple,", "the open file."], zh: ["苹果，", "一份公开档案。"] },
    lede: {
      en: "Full Apple Event and WWDC keynotes from Apple’s own channel, 2020 through 2026. Ads, holiday films, and recap cuts are left out. Older Steve Jobs keynotes stay on his file, because Apple does not host those recordings.",
      zh: "2020 年到 2026 年苹果自己频道上的完整 Apple Event 和 WWDC 主题演讲。广告、节日短片和回顾剪辑不收录。更早的乔布斯主题演讲仍在他的档案里，因为苹果公司频道没有托管那些录像。",
    },
  },
  {
    slug: "nvidia",
    name: "NVIDIA",
    nameZh: "英伟达",
    letter: { en: "N", zh: "Y" },
    mark: { en: "NV", zh: "英" },
    headline: { en: ["NVIDIA,", "the open file."], zh: ["英伟达，", "一份公开档案。"] },
    lede: {
      en: "GTC, COMPUTEX, CES, and SIGGRAPH keynotes from the NVIDIA channel. They also stay on Jensen Huang’s file. Long interviews on other channels stay on his file only.",
      zh: "英伟达频道上的 GTC、COMPUTEX、CES 和 SIGGRAPH 主题演讲。这些也仍留在黄仁勋的档案里。其他频道的长访谈只留在他的档案中。",
    },
  },
  {
    slug: "spacex",
    name: "SpaceX",
    nameZh: "太空探索技术公司",
    letter: { en: "S", zh: "T" },
    mark: { en: "SX", zh: "太" },
    headline: { en: ["SpaceX,", "the open file."], zh: ["太空探索技术公司，", "一份公开档案。"] },
    lede: {
      en: "Official SpaceX films and a sample of launch webcasts from the SpaceX channel: Starship briefings, crew flights, and a few science and rideshare missions. Short recaps, animations, and routine Starlink flights are left out. Two Starship updates also stay on Elon Musk’s file.",
      zh: "来自 SpaceX 官方频道的影片，以及一部分发射直播：星舰说明、载人飞行，和几次科学与拼车任务。短片回顾、动画和常规星链发射不收录。两场星舰更新也仍留在埃隆·马斯克的档案里。",
    },
  },
  {
    slug: "tesla",
    name: "Tesla",
    nameZh: "特斯拉",
    letter: { en: "T", zh: "T" },
    mark: { en: "T", zh: "特" },
    headline: { en: ["Tesla,", "the open file."], zh: ["特斯拉，", "一份公开档案。"] },
    lede: {
      en: "Official unveilings and shareholder events from the Tesla channel. These recordings also stay on Elon Musk’s file. Interviews published by other channels stay on his file only.",
      zh: "特斯拉频道上的发布会和股东大会。这些录像也仍留在埃隆·马斯克的档案里。其他频道发布的访谈只留在他的档案中。",
    },
  },
];

export const companySearchAliases: Record<string, string[]> = {
  spacex: ["SpaceX", "太空探索技术公司", "太空探索", "星舰"],
  tesla: ["Tesla", "特斯拉"],
  nvidia: ["NVIDIA", "Nvidia", "英伟达"],
  amd: ["AMD", "超威", "超威半导体"],
  apple: ["Apple", "苹果"],
};

export function companyBySlug(slug: string | null | undefined) {
  if (!slug) return undefined;
  return companies.find((company) => company.slug === slug);
}
