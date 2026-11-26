"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import {
  createInitialEngagementState,
  engagementReducer,
  engagementStorageKey,
  migrateEngagementState,
  type EngagementAction,
  type EngagementState,
} from "@/data/engagement";

type EngagementContextValue = {
  state: EngagementState;
  dispatch: Dispatch<EngagementAction>;
  storageError: string | null;
};

const EngagementContext = createContext<EngagementContextValue | null>(null);

export function EngagementProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    engagementReducer,
    undefined,
    createInitialEngagementState,
  );
  const isHydrated = useRef(false);
  const [storageError, reportStorageError] = useReducer(
    (_current: string | null, message: string | null) => message,
    null,
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(engagementStorageKey);

    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        const migrated = migrateEngagementState(parsed);
        if (migrated) {
          dispatch({ type: "replace", state: migrated });
        } else {
          reportStorageError("保存済みの回遊データ形式が不正です。");
        }
      } catch (error) {
        console.error("Failed to parse engagement state", error);
        reportStorageError("保存済みの回遊データを読み込めませんでした。");
      }
    }

    isHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!isHydrated.current) {
      return;
    }

    try {
      window.localStorage.setItem(engagementStorageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to persist engagement state", error);
      reportStorageError("回遊データを端末に保存できませんでした。");
    }
  }, [state]);

  return (
    <EngagementContext.Provider value={{ state, dispatch, storageError }}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagement() {
  const context = useContext(EngagementContext);
  if (!context) {
    throw new Error("useEngagement must be used within EngagementProvider");
  }

  return context;
}
