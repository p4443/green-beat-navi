"use client";

import Link from "next/link";
import { useState } from "react";
import { stampCheckpoints } from "@/data/engagement";
import { appConfig } from "@/data/app";
import {
  evaluateCheckin,
  guardMessage,
  type GuardPosition,
} from "@/lib/checkin-guard";
import { useEngagement } from "./engagement-provider";
import styles from "./checkin-card.module.css";

function getCurrentPosition(): Promise<GuardPosition | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (result) =>
        resolve({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracyMeters: result.coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  });
}

export function CheckinCard({ checkpointId }: { checkpointId: string }) {
  const { state, dispatch } = useEngagement();
  const checkpoint = stampCheckpoints.find((item) => item.id === checkpointId);
  const [checking, setChecking] = useState(false);
  const [guardError, setGuardError] = useState<string | null>(null);

  if (!checkpoint) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <span>INVALID QR</span>
          <h1>チェックポイントが見つかりません</h1>
          <Link href="/stamps">スタンプ台紙へ戻る</Link>
        </section>
      </main>
    );
  }

  if (!state.participantId) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <span>{`JOIN ${appConfig.challengeName}`}</span>
          <div className={styles.mark}>{appConfig.appName.charAt(0)}</div>
          <h1>参加開始が必要です</h1>
          <p>
            企画と注意事項を確認してから、デジタルスタンプラリーを開始してください。
          </p>
          <Link href="/join">参加開始画面へ</Link>
          <Link href="/">ホームへ戻る</Link>
        </section>
      </main>
    );
  }

  const collected = state.stampIds.includes(checkpoint.id);
  const guard = appConfig.checkinGuard;

  async function handleCheckin() {
    if (!guard.enabled) {
      dispatch({ type: "check_in", checkpointId: checkpoint!.id });
      return;
    }

    setChecking(true);
    setGuardError(null);

    const index = stampCheckpoints.findIndex(
      (item) => item.id === checkpoint!.id,
    );
    const previous = index > 0 ? stampCheckpoints[index - 1] : null;

    // 順序・移動時間は位置情報の前に判定(不要な許可ダイアログを避ける)
    const preVerdict = evaluateCheckin({
      checkpoint: checkpoint!,
      previous,
      state,
      position: {
        latitude: checkpoint!.latitude,
        longitude: checkpoint!.longitude,
        accuracyMeters: 0,
      },
      radiusMeters: guard.radiusMeters,
    });
    if (!preVerdict.ok) {
      setGuardError(guardMessage(preVerdict));
      setChecking(false);
      return;
    }

    const position = await getCurrentPosition();
    const verdict = evaluateCheckin({
      checkpoint: checkpoint!,
      previous,
      state,
      position,
      radiusMeters: guard.radiusMeters,
    });
    if (!verdict.ok) {
      setGuardError(guardMessage(verdict));
      setChecking(false);
      return;
    }

    dispatch({ type: "check_in", checkpointId: checkpoint!.id });
    setChecking(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span>{checkpoint.role} CHECKPOINT</span>
        <div className={styles.mark}>{collected ? "✓" : checkpoint.order}</div>
        <h1>{checkpoint.name}</h1>
        <p>{checkpoint.description}</p>
        {guard.enabled && !collected && (
          <p className={styles.guardNote}>
            不正防止のため、現地で位置情報を確認してからスタンプを発行します。
          </p>
        )}
        {guardError && (
          <p className={styles.guardError} role="alert">
            {guardError}
          </p>
        )}
        <button
          type="button"
          disabled={collected || checking}
          onClick={() => void handleCheckin()}
        >
          {collected
            ? "スタンプ取得済み"
            : checking
              ? "現在地を確認中…"
              : "スタンプを受け取る"}
        </button>
        <Link href="/stamps">スタンプ台紙を見る</Link>
      </section>
    </main>
  );
}
