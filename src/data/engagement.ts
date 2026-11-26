export type NotificationPreference = "unknown" | "enabled" | "denied";

export type EngagementState = {
  version: 2;
  participantId: string | null;
  participationStartedAt: string | null;
  stampIds: string[];
  favoriteProgramIds: string[];
  favoriteSpotIds: string[];
  notificationPreference: NotificationPreference;
};

export type EngagementAction =
  | {
      type: "start_participation";
      participantId: string;
      startedAt: string;
    }
  | { type: "check_in"; checkpointId: string }
  | { type: "toggle_program_favorite"; id: string }
  | { type: "toggle_spot_favorite"; id: string }
  | {
      type: "set_notification_preference";
      preference: NotificationPreference;
    }
  | { type: "replace"; state: EngagementState }
  | { type: "reset" };

export const engagementStorageKey = "green-beat-demo-engagement-v1";

export const stampCheckpoints = [
  {
    id: "station-start",
    order: 1,
    name: "森林公園駅 北口",
    role: "START",
    description: "北口ロータリーからプロムナードへ出発",
  },
  {
    id: "greenway-cafe",
    order: 2,
    name: "GREENWAY CAFÉ",
    role: "GREENWAY",
    description: "緑道の音楽と地域の味を体験",
  },
  {
    id: "south-gate-turn",
    order: 3,
    name: "森林公園 南口",
    role: "TURN",
    description: "約2.9km地点で復路へ折り返し",
  },
  {
    id: "station-goal",
    order: 4,
    name: "森林公園駅 北口",
    role: "GOAL",
    description: "往復約5.8kmを歩いてゴール",
  },
] as const;

export function createInitialEngagementState(): EngagementState {
  return {
    version: 2,
    participantId: null,
    participationStartedAt: null,
    stampIds: [],
    favoriteProgramIds: [],
    favoriteSpotIds: [],
    notificationPreference: "unknown",
  };
}

function toggle(values: string[], id: string) {
  return values.includes(id)
    ? values.filter((value) => value !== id)
    : [...values, id];
}

export function engagementReducer(
  state: EngagementState,
  action: EngagementAction,
): EngagementState {
  switch (action.type) {
    case "start_participation":
      if (state.participantId) {
        return state;
      }

      return {
        ...state,
        participantId: action.participantId,
        participationStartedAt: action.startedAt,
        stampIds: state.stampIds.includes(stampCheckpoints[0].id)
          ? state.stampIds
          : [stampCheckpoints[0].id, ...state.stampIds],
      };
    case "check_in":
      if (
        !stampCheckpoints.some(
          (checkpoint) => checkpoint.id === action.checkpointId,
        ) ||
        state.stampIds.includes(action.checkpointId)
      ) {
        return state;
      }

      return {
        ...state,
        stampIds: [...state.stampIds, action.checkpointId],
      };
    case "toggle_program_favorite":
      return {
        ...state,
        favoriteProgramIds: toggle(state.favoriteProgramIds, action.id),
      };
    case "toggle_spot_favorite":
      return {
        ...state,
        favoriteSpotIds: toggle(state.favoriteSpotIds, action.id),
      };
    case "set_notification_preference":
      return {
        ...state,
        notificationPreference: action.preference,
      };
    case "replace":
      return action.state;
    case "reset":
      return createInitialEngagementState();
  }
}

export function isEngagementState(value: unknown): value is EngagementState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EngagementState>;
  return (
    candidate.version === 2 &&
    (candidate.participantId === null ||
      typeof candidate.participantId === "string") &&
    (candidate.participationStartedAt === null ||
      typeof candidate.participationStartedAt === "string") &&
    Array.isArray(candidate.stampIds) &&
    Array.isArray(candidate.favoriteProgramIds) &&
    Array.isArray(candidate.favoriteSpotIds) &&
    ["unknown", "enabled", "denied"].includes(
      candidate.notificationPreference ?? "",
    )
  );
}

export function migrateEngagementState(value: unknown): EngagementState | null {
  if (isEngagementState(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (
    candidate.version !== 1 ||
    !Array.isArray(candidate.stampIds) ||
    !Array.isArray(candidate.favoriteProgramIds) ||
    !Array.isArray(candidate.favoriteSpotIds) ||
    !["unknown", "enabled", "denied"].includes(
      typeof candidate.notificationPreference === "string"
        ? candidate.notificationPreference
        : "",
    )
  ) {
    return null;
  }

  return {
    version: 2,
    participantId: null,
    participationStartedAt: null,
    stampIds: candidate.stampIds.filter(
      (value): value is string => typeof value === "string",
    ),
    favoriteProgramIds: candidate.favoriteProgramIds.filter(
      (value): value is string => typeof value === "string",
    ),
    favoriteSpotIds: candidate.favoriteSpotIds.filter(
      (value): value is string => typeof value === "string",
    ),
    notificationPreference:
      candidate.notificationPreference as NotificationPreference,
  };
}
