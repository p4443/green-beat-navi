import { describe, expect, it } from "vitest";
import { eventSummary, featuredPrograms, navigationItems } from "./event";

describe("event data", () => {
  it("uses unique program ids", () => {
    const ids = featuredPrograms.map((program) => program.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("provides navigable links for every guide item", () => {
    expect(navigationItems.every((item) => item.href.startsWith("/"))).toBe(true);
  });

  it("uses a 24-hour time label for every program", () => {
    expect(
      featuredPrograms.every((program) => /^\d{2}:\d{2}$/.test(program.time)),
    ).toBe(true);
  });

  it("identifies the organizer and designated manager", () => {
    expect(eventSummary.organizer).toBe("埼玉県森林公園緑道");
    expect(eventSummary.designatedManager).toBe(
      "一般社団法人埼玉県造園業協会",
    );
  });

  it("uses an inclusive finale name and participant description", () => {
    const finale = featuredPrograms.find((program) => program.id === "finale");

    expect(finale?.title).toBe("GREEN BEAT 100 Grand Ensemble");
    expect(finale?.description).toContain("サックス");
    expect(finale?.description).toContain("吹奏楽部");
  });
});
