// Re-check catalogue titles and channels against YouTube oEmbed.
// Usage: node scripts/verify-catalogue.mjs

import { readFile } from "node:fs/promises";

const catalogue = JSON.parse(await readFile(new URL("../src/data/catalogue.json", import.meta.url), "utf8"));
let failed = 0;

for (const video of catalogue.videos) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${video.id}`)}&format=json`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      failed += 1;
      console.error(`FAIL ${video.id} oEmbed HTTP ${response.status}`);
      continue;
    }
    const data = await response.json();
    const titleOk = data.title === video.title;
    const channelOk = data.author_name === video.channel;
    if (!titleOk || !channelOk) {
      failed += 1;
      console.error(`FAIL ${video.id}`);
      console.error(`  catalogue: ${video.title} | ${video.channel}`);
      console.error(`  oEmbed:    ${data.title} | ${data.author_name}`);
    } else {
      console.log(`ok ${video.id}`);
    }
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${video.id} ${error instanceof Error ? error.message : error}`);
  }
}

console.log(`\n${catalogue.videos.length - failed}/${catalogue.videos.length} matched`);
if (failed > 0) process.exit(1);
