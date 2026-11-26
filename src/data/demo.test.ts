import { describe, expect, it } from "vitest";
import { scheduleItems } from "./schedule";
import { eventSpots } from "./spots";

describe("presentation demo data", () => {
  it("distinguishes verified route points from provisional event spots", () => {
    const endpoints = eventSpots.filter((spot) =>
      ["station-north-rotary", "south-gate", "station-north-goal"].includes(
        spot.id,
      ),
    );
    const intermediateSpots = eventSpots.filter(
      (spot) => !endpoints.includes(spot),
    );

    expect(
      endpoints.every((spot) => spot.coordinateStatus === "verified"),
    ).toBe(true);
    expect(
      intermediateSpots.every(
        (spot) => spot.coordinateStatus === "provisional",
      ),
    ).toBe(true);
  });

  it("starts and finishes at the station north rotary", () => {
    const start = eventSpots.find((spot) => spot.id === "station-north-rotary");
    const goal = eventSpots.find((spot) => spot.id === "station-north-goal");

    expect(goal?.name).toBe("GOAL｜森林公園駅 北口ロータリー");
    expect(goal?.latitude).toBe(start?.latitude);
    expect(goal?.longitude).toBe(start?.longitude);
  });

  it("uses unique ids for spots and schedule entries", () => {
    const spotIds = eventSpots.map((spot) => spot.id);
    const scheduleIds = scheduleItems.map((item) => item.id);

    expect(new Set(spotIds).size).toBe(spotIds.length);
    expect(new Set(scheduleIds).size).toBe(scheduleIds.length);
  });

  it("includes saxophones and wind bands in the finale", () => {
    const finale = scheduleItems.find((item) => item.id === "finale");

    expect(finale?.participants).toContain("サックス");
    expect(finale?.participants).toContain("吹奏楽部");
  });
});
