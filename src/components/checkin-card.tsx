"use client";

import Link from "next/link";
import { stampCheckpoints } from "@/data/engagement";
import { useEngagement } from "./engagement-provider";
import styles from "./checkin-card.module.css";

export function CheckinCard({ checkpointId }: { checkpointId: string }) {
  const { state, dispatch } = useEngagement();
  const checkpoint = stampCheckpoints.find((item) => item.id === checkpointId);

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
          <span>JOIN GREENWAY CHALLENGE</span>
          <div className={styles.mark}>G</div>
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

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span>{checkpoint.role} CHECKPOINT</span>
        <div className={styles.mark}>{collected ? "✓" : checkpoint.order}</div>
        <h1>{checkpoint.name}</h1>
        <p>{checkpoint.description}</p>
        <button
          type="button"
          disabled={collected}
          onClick={() =>
            dispatch({ type: "check_in", checkpointId: checkpoint.id })
          }
        >
          {collected ? "スタンプ取得済み" : "スタンプを受け取る"}
        </button>
        <Link href="/stamps">スタンプ台紙を見る</Link>
      </section>
    </main>
  );
}
