"use client";

import Link from "next/link";
import QRCode from "react-qr-code";
import { useSyncExternalStore } from "react";
import { stampCheckpoints } from "@/data/engagement";
import styles from "./qr-gallery.module.css";

const stepLabels = [
  "ここから参加開始",
  "緑道を進んでチェックイン",
  "南口で折り返し",
  "北口に戻ってゴール",
] as const;

function subscribeToOrigin() {
  return () => undefined;
}

export function QrGallery({ baseUrl }: { baseUrl: string }) {
  const currentOrigin = useSyncExternalStore(
    subscribeToOrigin,
    () => window.location.origin,
    () => baseUrl,
  );

  return (
    <main className={styles.page}>
      <header>
        <span>PRESENTATION TOOL</span>
        <h1>チェックポイントQR</h1>
        <p>
          森林公園駅北口のSTARTから順番に進みます。まず「1」のQRを読み取って参加を開始してください。
        </p>
        <Link href="/stamps">スタンプ台紙へ戻る</Link>
      </header>

      <section className={styles.routeGuide} aria-labelledby="route-title">
        <div>
          <span>ROUTE GUIDE</span>
          <h2 id="route-title">QRを読む順番</h2>
        </div>
        <ol>
          {stampCheckpoints.map((checkpoint, index) => (
            <li key={checkpoint.id}>
              <strong>{index + 1}</strong>
              <span>{index === 0 ? "START" : checkpoint.role}</span>
              <b>{checkpoint.name}</b>
              <small>{stepLabels[index]}</small>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.grid}>
        {stampCheckpoints.map((checkpoint, index) => {
          const url =
            index === 0
              ? `${currentOrigin}/join`
              : `${currentOrigin}/checkin/${checkpoint.id}`;
          const nextCheckpoint = stampCheckpoints[index + 1];

          return (
            <article
              className={index === 0 ? styles.startCard : undefined}
              key={checkpoint.id}
            >
              {index === 0 && (
                <strong className={styles.startBadge}>
                  最初に読み取るQR
                </strong>
              )}
              <span>
                STEP {checkpoint.order} / {index === 0 ? "START" : checkpoint.role}
              </span>
              <h2>{checkpoint.name}</h2>
              {index === 0 && (
                <p className={styles.description}>
                  このQRから参加します。企画説明と注意事項を確認すると、参加IDとSTARTスタンプを受け取れます。
                </p>
              )}
              <div className={styles.qr}>
                <QRCode value={url} size={180} />
              </div>
              <p className={styles.nextStep}>
                {nextCheckpoint
                  ? `読み取り後 → 次は「${nextCheckpoint.name}」へ`
                  : "読み取り後 → 完走・達成クーポンを確認"}
              </p>
              <code>{url}</code>
            </article>
          );
        })}
      </div>
    </main>
  );
}
