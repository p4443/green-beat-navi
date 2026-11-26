import { describe, expect, it } from "vitest";
import {
  createInitialEngagementState,
  engagementReducer,
  isEngagementState,
  migrateEngagementState,
  stampCheckpoints,
} from "./engagement";

describe("visitor engagement state", () => {
  it("starts anonymous participation and awards the start stamp once", () => {
    const initial = createInitialEngagementState();
    const started = engagementReducer(initial, {
      type: "start_participation",
      participantId: "GB-12345678",
      startedAt: "2026-11-19T06:30:00.000Z",
    });
    const duplicate = engagementReducer(started, {
      type: "start_participation",
      participantId: "GB-OTHER",
      startedAt: "2026-11-19T06:31:00.000Z",
    });

    expect(started.participantId).toBe("GB-12345678");
    expect(started.stampIds).toEqual([stampCheckpoints[0].id]);
    expect(duplicate).toBe(started);
  });

  it("awards each valid checkpoint once", () => {
    const initial = createInitialEngagementState();
    const first = engagementReducer(initial, {
      type: "check_in",
      checkpointId: stampCheckpoints[0].id,
    });
    const duplicate = engagementReducer(first, {
      type: "check_in",
      checkpointId: stampCheckpoints[0].id,
    });

    expect(first.stampIds).toEqual([stampCheckpoints[0].id]);
    expect(duplicate).toBe(first);
  });

  it("rejects unknown checkpoints", () => {
    const initial = createInitialEngagementState();
    const next = engagementReducer(initial, {
      type: "check_in",
      checkpointId: "unknown",
    });

    expect(next).toBe(initial);
  });

  it("toggles favorites", () => {
    const initial = createInitialEngagementState();
    const favorite = engagementReducer(initial, {
      type: "toggle_program_favorite",
      id: "finale",
    });
    const removed = engagementReducer(favorite, {
      type: "toggle_program_favorite",
      id: "finale",
    });

    expect(favorite.favoriteProgramIds).toContain("finale");
    expect(removed.favoriteProgramIds).not.toContain("finale");
  });

  it("recognizes persisted engagement data", () => {
    expect(isEngagementState(createInitialEngagementState())).toBe(true);
    expect(isEngagementState({ version: 1, stampIds: [] })).toBe(false);
  });

  it("migrates version 1 engagement data without losing progress", () => {
    const migrated = migrateEngagementState({
      version: 1,
      stampIds: [stampCheckpoints[1].id],
      favoriteProgramIds: ["finale"],
      favoriteSpotIds: [],
      notificationPreference: "unknown",
    });

    expect(migrated).toMatchObject({
      version: 2,
      participantId: null,
      stampIds: [stampCheckpoints[1].id],
      favoriteProgramIds: ["finale"],
    });
  });
});
