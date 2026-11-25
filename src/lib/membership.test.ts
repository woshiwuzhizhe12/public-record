import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { videoHref, videoPeople } from "./membership.ts";

describe("videoPeople", () => {
  it("keeps a single-person video on that person", () => {
    assert.deepEqual(videoPeople({ person: "elon-musk" }), ["elon-musk"]);
  });

  it("lists the guest and Joe Rogan once each", () => {
    assert.deepEqual(
      videoPeople({ person: "elon-musk", people: ["elon-musk", "joe-rogan"] }),
      ["elon-musk", "joe-rogan"],
    );
  });

  it("skips an empty person on a company-only video", () => {
    assert.deepEqual(videoPeople({ person: "" }), []);
  });
});

describe("videoHref", () => {
  it("keeps the file the viewer opened", () => {
    assert.equal(videoHref("ycPr5-27vSI", "joe-rogan"), "/v/ycPr5-27vSI?person=joe-rogan");
  });

  it("keeps a company file shareable", () => {
    assert.equal(videoHref("8ySMdUIF3cY", { company: "spacex" }), "/v/8ySMdUIF3cY?company=spacex");
  });
});
