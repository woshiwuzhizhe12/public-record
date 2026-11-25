# Public Record 公开记录

An unofficial index of public appearances. The first file follows Elon Musk: interviews, keynotes, shareholder meetings, podcasts and press conferences. Videos play from the YouTube channels that published them. This site does not re-host video files.

The layout sits in the same family as other clean appearance archives — a centered column, heavy headlines, tag filters, a detail page with a player — while the name, copy, code and catalogue are original.

## Requirements

Node.js 20 or newer. Next.js also accepts 18.18 and 19.8. This copy was checked with Node 22. `npm test` uses Node’s type-stripping flag and needs Node 22 or newer.

## Run it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123). The dev server listens on port 43123.

```bash
npm test        # filter logic
npm run lint
npm run build
node scripts/verify-catalogue.mjs   # re-check titles and channels against YouTube
```

## What’s in the starter file

The left rail switches files. It shows only letters that have someone in the catalogue. Click a letter to see those people’s initials and names, then click a person to open their file. In English the letter is the first letter of the display name (Elon Musk is E, Jensen Huang and Joe Rogan are J, Steve Jobs is S, Lisa Su is L). In 简体中文 it is the pinyin initial used here: 马斯克 is M, 黄仁勋 is H, 乔·罗根 and 乔布斯 are Q, 苏姿丰 is S. Each person in that list has a small portrait stored in `public/portraits/`, with the source and license in `public/portraits/ATTRIBUTION.md`. A person without a licensed portrait keeps a typographic initial.

Elon Musk stays at `/` (or `/?person=elon-musk`). Jensen Huang is `/?person=jensen-huang`. Joe Rogan is `/?person=joe-rogan`. Steve Jobs is `/?person=steve-jobs`. Lisa Su is `/?person=lisa-su`. Filters, search, and the timeline stay inside the person you picked. A video can list extra slugs in `people`, so the eight verified Joe Rogan Experience episodes appear on Rogan's file and still remain on Musk's or Huang's file.

Elon Musk: 47 appearances. Jensen Huang: 36 appearances. Joe Rogan: 1,801 official full-length episodes from the PowerfulJRE YouTube channel (numbered Joe Rogan Experience episodes and JRE MMA shows). Eight of those also stay on Musk’s or Huang’s file. Clips, compilations, fight companions, and one official re-upload were left out. Hundreds of episode numbers are absent from that YouTube channel; this pass did not add anything that is only on Spotify. Steve Jobs: 11 appearances (the Stanford address, full keynotes and long interviews that are still public). Lisa Su: 15 appearances (AMD keynotes and long interviews). Apple does not host most of the full historical keynotes, so those Jobs recordings are the public archive uploads, labeled with the channel that posted them. Duplicate cuts of the same event, including the CES channel copies of AMD’s own keynotes, were left out. No verified Joe Rogan episode with Jobs or Su was added. Titles, channels, dates, and durations were checked against the live YouTube page on 25 November 2026. Huang’s file is mostly official NVIDIA uploads plus long-form interviews. Musk’s file mixes company keynotes with the same kind of interviews. For each one the catalogue stores the title, channel, channel URL, upload or stream date, and duration returned by YouTube that day. Topics and formats are editorial labels, limited to subjects named in the title, the publisher’s description, or that description’s chapter headings.

Dates:

- A plain date is a livestream, a premiere, or an event day stated in the publisher’s description.
- A date with “≈” is the upload date.
- Two 60 Minutes segments keep the year printed in the title for the timeline. The video page says so.

Where a publisher put timestamps in the description, or a Bilibili uploader saved chapter markers, those headings are included.

Seven Joe Rogan episodes also have a verified Bilibili upload. In 简体中文 the player starts on Bilibili when that upload exists, and the YouTube VPN notice stays hidden until the viewer switches back to YouTube. Chapter clicks restart the Bilibili embed at that timestamp; the page cannot scrub inside the iframe. Episode #2223 has no full-length Bilibili upload close enough to the YouTube cut, so it stays on YouTube only. Those rows are copied from the publisher’s own description and can seek the player. They are section titles, not a transcript. This file does not invent quotations and does not store full captions.

Musk, Huang, Rogan, and Lisa Su entries prefer the channel that produced the recording, including Tesla, SpaceX, NVIDIA, AMD, TED, Saturday Night Live, 60 Minutes, Lex Fridman, and Acquired. Most full Steve Jobs keynotes are not on Apple’s channel, so those rows name the public archive channel that still hosts the complete recording.

## Embeds and rights

The player is a YouTube embed (`youtube-nocookie.com`) with a local control bar. Thumbnails are loaded from `i.ytimg.com` (a missing high-resolution frame falls back to the standard one). The footer states that videos belong to their respective owners. In 简体中文, a YouTube embed shows a notice that playback in mainland China may require a VPN. If YouTube refuses the embed, the poster stays up with one link back to the original upload. Chapter rows still move the time display.

## Add a person or a video

`src/data/catalogue.json` is the whole catalogue.

- Add a person under `people` with `slug`, `name`, `nameZh`, `active`, `letter` (`en` and `zh`), `headline` and `lede` in English and 简体中文. Everyone with `active: true` appears in the left rail. The first active person is the default at `/`. Set a video's `person` to its main guest, and add other slugs in `people` when the same recording belongs on more than one file.
- Add a video under `videos` with a real YouTube id. Set `person` to that slug. Fill `title`, `channel`, `channelUrl`, `date`, `uploadDate`, `dateKind` (`stream`, `upload` or `event`), `year`, `durationSec`, `topics`, `format`, `sourceKind`, optional `dateNote`, and `chapters` (or an empty array).
- Check the id against YouTube before committing it. `node scripts/verify-catalogue.mjs` confirms the title and channel still match oEmbed.
- Do not paste fabricated quotes into `chapters`. Use headings the publisher actually published, or leave the list empty.

Filters, search, sort, the timeline and the detail page all read this file. Tags are derived in `src/data/catalogue.ts` (topic, format, period, platform, original channel, chapters). Several selected tags must all match.

## Stack

Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui primitives (button, input, dropdown). Interface copy is English and 简体中文. The theme control stores `light` or `dark` in `localStorage` (`pr-theme`); light is the default. Language is `pr-lang`.

## Visual check

Compared with the reference archive, this build keeps the same reading order: wordmark and nav that scroll away, a two-line hero, a stat row, a coral-edged note, a sticky search row, filters that open underneath, a large latest card, then a three-column list that becomes one column on a narrow screen. Detail pages have a back link, a wide player, timestamped rows and a side column. Branding is different on purpose: the name is Public Record / 公开记录, the headline is “Elon Musk, the open file.”, and there is no donation button.
