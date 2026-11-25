import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countForTag, filterVideos, sortVideos, type Filterable } from "./filter.ts";

const videos: Filterable[] = [
  {
    id: "a",
    title: "Battery Day",
    channel: "Tesla",
    date: "2020-09-22",
    dateApproximate: false,
    durationSec: 100,
    tags: ["topic:tesla", "format:keynote", "period:2020-2022"],
    chapterTitles: ["Battery Day Keynote"],
  },
  {
    id: "b",
    title: "Starship Update",
    channel: "SpaceX",
    date: "2019-09-28",
    dateApproximate: false,
    durationSec: 300,
    tags: ["topic:spacex", "format:keynote", "period:2015-2019"],
    chapterTitles: [],
  },
  {
    id: "c",
    title: "DealBook Summit",
    channel: "New York Times Events",
    date: "2023-11-30",
    dateApproximate: true,
    durationSec: 50,
    tags: ["topic:x", "format:interview", "period:2023"],
    chapterTitles: ["Advertising on Twitter"],
  },
  {
    id: "d",
    title: "Same day upload",
    channel: "Example",
    date: "2023-11-30",
    dateApproximate: true,
    durationSec: 80,
    tags: ["topic:society", "format:interview", "period:2023"],
    chapterTitles: [],
  },
  {
    id: "e",
    title: "Same day stream",
    channel: "Example",
    date: "2023-11-30",
    dateApproximate: false,
    durationSec: 10,
    tags: ["topic:politics", "format:interview", "period:2023"],
    chapterTitles: [],
  },
];

describe("filterVideos", () => {
  it("returns the whole list when nothing is selected", () => {
    assert.equal(filterVideos(videos, "", []).length, 5);
  });

  it("requires every selected tag", () => {
    assert.deepEqual(
      filterVideos(videos, "", ["topic:tesla", "format:keynote"]).map((video) => video.id),
      ["a"],
    );
    assert.equal(filterVideos(videos, "", ["topic:tesla", "topic:spacex"]).length, 0);
  });

  it("searches titles, channels, and chapter headings", () => {
    assert.deepEqual(filterVideos(videos, "starship", []).map((video) => video.id), ["b"]);
    assert.deepEqual(filterVideos(videos, "tesla", []).map((video) => video.id), ["a"]);
    assert.deepEqual(filterVideos(videos, "twitter", []).map((video) => video.id), ["c"]);
  });

  it("searches extra aliases such as a Chinese show name", () => {
    const withAlias = videos.map((video, index) =>
      index === 0 ? { ...video, extraSearch: ["乔·罗根", "PowerfulJRE"] } : video,
    );
    assert.deepEqual(filterVideos(withAlias, "乔·罗根", []).map((video) => video.id), ["a"]);
    assert.deepEqual(filterVideos(withAlias, "powerfuljre", []).map((video) => video.id), ["a"]);
  });
});

describe("countForTag", () => {
  it("counts the intersection of the search, current tags, and the pill", () => {
    assert.equal(countForTag(videos, "topic:spacex", "", []), 1);
    assert.equal(countForTag(videos, "topic:tesla", "", ["format:keynote"]), 1);
    assert.equal(countForTag(videos, "topic:x", "", ["format:keynote"]), 0);
    assert.equal(countForTag(videos, "format:keynote", "", ["format:keynote"]), 2);
  });

  it("follows the search", () => {
    assert.equal(countForTag(videos, "topic:tesla", "battery", []), 1);
    assert.equal(countForTag(videos, "topic:spacex", "battery", []), 0);
  });
});

describe("sortVideos", () => {
  it("orders newest streams ahead of uploads on the same day", () => {
    const ids = sortVideos(videos, "newest").map((video) => video.id);
    assert.deepEqual(ids.slice(0, 3), ["e", "d", "c"]);
  });

  it("orders oldest and longest independently", () => {
    assert.equal(sortVideos(videos, "oldest")[0]?.id, "b");
    assert.equal(sortVideos(videos, "longest")[0]?.id, "b");
  });
});
