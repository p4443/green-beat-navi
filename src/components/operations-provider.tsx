"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useCallback,
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

const POLL_INTERVAL_MS = 15_000;

type ServerResponse =
  | { mode: "local" }
  | { mode: "server"; state: OperationsState };

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    operationsReducer,
    undefined,
    createInitialOperationsState,
  );
  const isHydrated = useRef(false);
  // "unknown" → 初回GETで "server"(サーバー同期)か "local"(従来の端末内デモ)へ確定
  const modeRef = useRef<"unknown" | "server" | "local">("unknown");
  const [storageError, reportStorageError] = useReducer(
    (_current: string | null, message: string | null) => message,
    null,
  );

  const refreshFromServer = useCallback(async () => {
    try {
      const response = await fetch("/api/operations", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      const data = (await response.json()) as ServerResponse;
      if (data.mode === "server" && isOperationsState(data.state)) {
        dispatch({ type: "replace", state: data.state });
        return "server" as const;
      }
      return "local" as const;
    } catch (error) {
      console.error("operations sync failed", error);
      return null;
    }
  }, []);

  // 初期化: サーバーモード判定 → localモード時はlocalStorage復元
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const serverMode = await refreshFromServer();
      if (cancelled) {
        return;
      }

      if (serverMode === "server") {
        modeRef.current = "server";
        isHydrated.current = true;
        return;
      }

      modeRef.current = "local";
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
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [refreshFromServer]);

  // サーバーモード: ポーリング+画面復帰時の再取得
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (modeRef.current === "server") {
        void refreshFromServer();
      }
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (modeRef.current === "server" && !document.hidden) {
        void refreshFromServer();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshFromServer]);

  // localモード: localStorageへ保存
  useEffect(() => {
    if (!isHydrated.current || modeRef.current !== "local") {
      return;
    }

    try {
      window.localStorage.setItem(operationsStorageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to persist demo operations state", error);
      reportStorageError("デモデータを端末に保存できませんでした。");
    }
  }, [state]);

  // localモード: 同一ブラウザの別タブと同期
  useEffect(() => {
    const syncState = (event: StorageEvent) => {
      if (
        modeRef.current !== "local" ||
        event.key !== operationsStorageKey ||
        !event.newValue
      ) {
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

  // 操作のディスパッチ: サーバーモード時はAPIへ送信し、確定状態で上書きする
  const dispatchAction = useCallback(
    (action: OperationsAction) => {
      dispatch(action);

      if (modeRef.current !== "server" || action.type === "replace") {
        return;
      }

      void (async () => {
        try {
          const response = await fetch("/api/operations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
            cache: "no-store",
          });
          if (response.status === 401) {
            reportStorageError("ログインの有効期限が切れました。再ログインしてください。");
            return;
          }
          if (response.status === 403) {
            reportStorageError("この操作を行う権限がありません。");
            void refreshFromServer();
            return;
          }
          if (!response.ok) {
            throw new Error(`status ${response.status}`);
          }
          const data = (await response.json()) as ServerResponse;
          if (data.mode === "server" && isOperationsState(data.state)) {
            dispatch({ type: "replace", state: data.state });
            reportStorageError(null);
          }
        } catch (error) {
          console.error("operations update failed", error);
          reportStorageError(
            "サーバーへの反映に失敗しました。通信状態を確認してください。",
          );
          void refreshFromServer();
        }
      })();
    },
    [refreshFromServer],
  );

  return (
    <OperationsContext.Provider
      value={{ state, dispatch: dispatchAction, storageError }}
    >
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
