"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useEngagement } from "./engagement-provider";
import styles from "./join-experience.module.css";

function createParticipantId() {
  const randomValues = new Uint8Array(4);
  crypto.getRandomValues(randomValues);
  const suffix = Array.from(randomValues, (value) =>
    value.toString(16).padStart(2, "0"),
  )
    .join("")
    .toUpperCase();

  return `GB-${suffix}`;
}

export function JoinExperience() {
  const { state, dispatch } = useEngagement();
  const [stage, setStage] = useState<"intro" | "confirm">("intro");
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const router = useRouter();

  function startParticipation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasConfirmed || state.participantId) {
      return;
    }

    dispatch({
      type: "start_participation",
      participantId: createParticipantId(),
      startedAt: new Date().toISOString(),
    });
    router.push("/map");
  }

  if (state.participantId) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <span>ALREADY JOINED</span>
          <h1>参加受付が完了しました</h1>
          <p className={styles.lead}>
            この画面が参加確認です。STARTスタンプを取得しました。次は緑道を進み「GREENWAY CAFÉ」を目指してください。
          </p>
          <p className={styles.idLabel}>参加ID</p>
          <strong className={styles.participantId}>{state.participantId}</strong>
          <Link className={styles.primaryLink} href="/map">
            会場マップを開く
          </Link>
          <Link className={styles.secondaryLink} href="/stamps">
            スタンプ台紙を見る
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span>GREENWAY CHALLENGE</span>
        <h1>無料で参加する</h1>
        <p className={styles.lead}>
          森林公園駅北口から南口を往復し、4つのデジタルスタンプを集める約5.8kmのチャレンジです。
        </p>

        <dl className={styles.summary}>
          <div>
            <dt>距離</dt>
            <dd>往復 約5.8km</dd>
          </div>
          <div>
            <dt>チェックポイント</dt>
            <dd>4地点</dd>
          </div>
          <div>
            <dt>参加費</dt>
            <dd>無料（デモ）</dd>
          </div>
        </dl>

        {stage === "intro" ? (
          <button
            className={styles.joinButton}
            type="button"
            onClick={() => setStage("confirm")}
          >
            参加する
          </button>
        ) : (
          <section className={styles.confirmation} aria-labelledby="confirm-title">
            <span>ANONYMOUS CONFIRMATION</span>
            <h2 id="confirm-title">匿名参加を確認</h2>
            <p>
              個人情報は入力しません。この端末に匿名の参加IDを発行します。
            </p>
            <div className={styles.notice}>
              <h3>参加前にご確認ください</h3>
              <ul>
                <li>歩行中は画面を操作せず、安全な場所で立ち止まってください。</li>
                <li>スタンプは、この端末の同じブラウザーに保存されます。</li>
                <li>デモ版のため、参加IDと履歴はサーバーには送信されません。</li>
              </ul>
            </div>
            <form onSubmit={startParticipation}>
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={hasConfirmed}
                  onChange={(event) => setHasConfirmed(event.target.checked)}
                />
                <span>企画内容と注意事項を確認しました</span>
              </label>
              <button type="submit" disabled={!hasConfirmed}>
                確認して参加開始
              </button>
            </form>
            <button
              className={styles.backButton}
              type="button"
              onClick={() => setStage("intro")}
            >
              戻る
            </button>
          </section>
        )}

        <Link className={styles.secondaryLink} href="/">
          ホームへ戻る
        </Link>
      </section>
    </main>
  );
}
