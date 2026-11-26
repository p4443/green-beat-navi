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
  createInitialOperationsState,
  isOperationsState,
  operationsReducer,
  operationsStorageKey,
  type OperationsAction,
  type OperationsState,
} from "@/data/operations";

type OperationsContextValue = {
  state: OperationsState;
  dispatch: Dispatch<OperationsAction>;
  storageError: string | null;
};

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    operationsReducer,
    undefined,
    createInitialOperationsState,
  );
  const isHydrated = useRef(false);
  const [storageError, reportStorageError] = useReducer(
    (_current: string | null, message: string | null) => message,
    null,
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(operationsStorageKey);

    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (isOperationsState(parsed)) {
          dispatch({ type: "replace", state: parsed });
        } else {
          reportStorageError(
            "保存済みデモデータの形式が不正です。初期値を使用します。",
          );
        }
      } catch (error) {
        console.error("Failed to parse demo operations state", error);
        reportStorageError(
          "保存済みデモデータを読み込めませんでした。初期値を使用します。",
        );
      }
    }

    isHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!isHydrated.current) {
      return;
    }

    try {
      window.localStorage.setItem(operationsStorageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to persist demo operations state", error);
      reportStorageError("デモデータを端末に保存できませんでした。");
    }
  }, [state]);

  useEffect(() => {
    const syncState = (event: StorageEvent) => {
      if (event.key !== operationsStorageKey || !event.newValue) {
        return;
      }

      try {
        const parsed: unknown = JSON.parse(event.newValue);
        if (isOperationsState(parsed)) {
          dispatch({ type: "replace", state: parsed });
        }
      } catch (error) {
        console.error("Failed to synchronize demo operations state", error);
        reportStorageError("別画面からの更新を同期できませんでした。");
      }
    };

    window.addEventListener("storage", syncState);
    return () => window.removeEventListener("storage", syncState);
  }, []);

  return (
    <OperationsContext.Provider value={{ state, dispatch, storageError }}>
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error("useOperations must be used within OperationsProvider");
  }

  return context;
}
