import { describe, expect, it } from "vitest";
import {
  createInitialOperationsState,
  isOperationsState,
  operationsReducer,
} from "./operations";

describe("operations state", () => {
  it("initializes every schedule and spot", () => {
    const state = createInitialOperationsState();

    expect(Object.keys(state.schedule).length).toBeGreaterThan(0);
    expect(Object.keys(state.spots).length).toBeGreaterThan(0);
  });

  it("caps schedule delays and clears delay for on-time programs", () => {
    const initial = createInitialOperationsState();
    const delayed = operationsReducer(initial, {
      type: "set_schedule_status",
      id: "finale",
      status: "delayed",
      delayMinutes: 999,
    });
    const onTime = operationsReducer(delayed, {
      type: "set_schedule_status",
      id: "finale",
      status: "on_time",
      delayMinutes: 20,
    });

    expect(delayed.schedule.finale.delayMinutes).toBe(120);
    expect(onTime.schedule.finale.delayMinutes).toBe(0);
  });

  it("does not publish an empty announcement", () => {
    const initial = createInitialOperationsState();
    const next = operationsReducer(initial, {
      type: "publish_announcement",
      level: "emergency",
      message: "   ",
    });

    expect(next).toBe(initial);
  });

  it("recognizes the persisted state shape", () => {
    expect(isOperationsState(createInitialOperationsState())).toBe(true);
    expect(isOperationsState({ version: 1 })).toBe(false);
  });
});
