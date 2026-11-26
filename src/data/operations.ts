import { scheduleItems } from "./schedule";
import { eventSpots } from "./spots";

export type ScheduleStatus = "on_time" | "delayed" | "cancelled";
export type SpotAvailability = "open" | "paused" | "sold_out";
export type CongestionLevel = "low" | "medium" | "high";
export type AnnouncementLevel = "info" | "warning" | "emergency";

export type OperationsState = {
  version: 1;
  updatedAt: string;
  announcement: {
    active: boolean;
    level: AnnouncementLevel;
    message: string;
  };
  schedule: Record<
    string,
    {
      status: ScheduleStatus;
      delayMinutes: number;
    }
  >;
  spots: Record<
    string,
    {
      availability: SpotAvailability;
      congestion: CongestionLevel;
    }
  >;
};

export type OperationsAction =
  | {
      type: "set_schedule_status";
      id: string;
      status: ScheduleStatus;
      delayMinutes: number;
    }
  | {
      type: "set_spot_availability";
      id: string;
      availability: SpotAvailability;
    }
  | {
      type: "set_congestion";
      id: string;
      congestion: CongestionLevel;
    }
  | {
      type: "publish_announcement";
      level: AnnouncementLevel;
      message: string;
    }
  | { type: "clear_announcement" }
  | { type: "replace"; state: OperationsState }
  | { type: "reset" };

export const operationsStorageKey = "green-beat-demo-operations-v1";

export function createInitialOperationsState(): OperationsState {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    announcement: {
      active: false,
      level: "info",
      message: "",
    },
    schedule: Object.fromEntries(
      scheduleItems.map((item) => [
        item.id,
        { status: "on_time" as const, delayMinutes: 0 },
      ]),
    ),
    spots: Object.fromEntries(
      eventSpots.map((spot) => [
        spot.id,
        { availability: "open" as const, congestion: "low" as const },
      ]),
    ),
  };
}

function updated(state: OperationsState): OperationsState {
  return {
    ...state,
    updatedAt: new Date().toISOString(),
  };
}

export function operationsReducer(
  state: OperationsState,
  action: OperationsAction,
): OperationsState {
  switch (action.type) {
    case "set_schedule_status":
      if (!state.schedule[action.id]) {
        return state;
      }

      return updated({
        ...state,
        schedule: {
          ...state.schedule,
          [action.id]: {
            status: action.status,
            delayMinutes:
              action.status === "delayed"
                ? Math.max(1, Math.min(120, action.delayMinutes))
                : 0,
          },
        },
      });
    case "set_spot_availability":
      if (!state.spots[action.id]) {
        return state;
      }

      return updated({
        ...state,
        spots: {
          ...state.spots,
          [action.id]: {
            ...state.spots[action.id],
            availability: action.availability,
          },
        },
      });
    case "set_congestion":
      if (!state.spots[action.id]) {
        return state;
      }

      return updated({
        ...state,
        spots: {
          ...state.spots,
          [action.id]: {
            ...state.spots[action.id],
            congestion: action.congestion,
          },
        },
      });
    case "publish_announcement": {
      const message = action.message.trim();
      if (!message) {
        return state;
      }

      return updated({
        ...state,
        announcement: {
          active: true,
          level: action.level,
          message,
        },
      });
    }
    case "clear_announcement":
      return updated({
        ...state,
        announcement: {
          ...state.announcement,
          active: false,
        },
      });
    case "replace":
      return action.state;
    case "reset":
      return updated(createInitialOperationsState());
  }
}

export function isOperationsState(value: unknown): value is OperationsState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<OperationsState>;
  return (
    candidate.version === 1 &&
    typeof candidate.updatedAt === "string" &&
    typeof candidate.announcement === "object" &&
    candidate.announcement !== null &&
    typeof candidate.schedule === "object" &&
    candidate.schedule !== null &&
    typeof candidate.spots === "object" &&
    candidate.spots !== null
  );
}
