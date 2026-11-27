"use client";

import Link from "next/link";
import { useState } from "react";
import { stampCheckpoints } from "@/data/engagement";
import { appConfig } from "@/data/app";
import { useEngagement } from "./engagement-provider";
import styles from "./stamp-dashboard.module.css";

export function StampDashboard() {
  const { state, dispatch, storageError } = useEngagement();
  const [notificationMessage, setNotificationMessage] = useState("");
  const isComplete = state.stampIds.length === stampCheckpoints.length;

  async function requestNotifications() {
    if (!("Notification" in window)) {
      setNotificationMessage("このブラウザは通知に対応していません。");
      return;
    }

    const permission = await Notification.requestPermission();
    dispatch({
      type: "set_notification_preference",
      preference: permission === "granted" ? "enabled" : "denied",
    });
    setNotificationMessage(
      permission === "granted"
        ? "通知を有効にしました。配信サーバーは本番実装で接続します。"
        : "通知は許可されませんでした。ブラウザ設定から変更できます。",
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span>{appConfig.challengeName}</span>
          <h1>
            往復{appConfig.distanceLabel}
            <br />
            デジタルスタンプ
          </h1>
          <p>北口から南口へ。音楽と緑をめぐって、駅へ戻ろう。</p>
        </div>
        <div className={styles.progress}>
          <strong>{state.stampIds.length}</strong>
          <span>/ {stampCheckpoints.length} STAMPS</span>
        </div>
      </header>

      {storageError && <p className={styles.error}>{storageError}</p>}

      {!state.participantId ? (
        <section className={styles.joinPrompt} aria-labelledby="join-title">
          <span>START HERE</span>
          <h2 id="join-title">スタンプラリーに参加する</h2>
          <p>
            企画と注意事項を確認すると、匿名の参加IDとSTARTスタンプが発行されます。
          </p>
          <Link href="/join">参加開始画面へ</Link>
        </section>
      ) : (
        <>
          <p className={styles.participantId}>
            参加ID <strong>{state.participantId}</strong>
          </p>
      <section className={styles.stampGrid} aria-label="スタンプ台紙">
        {stampCheckpoints.map((checkpoint) => {
          const collected = state.stampIds.includes(checkpoint.id);

          return (
            <article
              className={collected ? styles.collected : undefined}
              key={checkpoint.id}
            >
              <span className={styles.order}>
                {String(checkpoint.order).padStart(2, "0")}
              </span>
              <div className={styles.stampMark} aria-hidden="true">
                {collected ? "✓" : checkpoint.role.slice(0, 1)}
              </div>
              <small>{checkpoint.role}</small>
              <h2>{checkpoint.name}</h2>
              <p>{checkpoint.description}</p>
              {appConfig.checkinGuard.enabled ? (
                <span className={styles.guardHint}>
                  {collected ? "取得済み" : "現地のQRで取得"}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={collected}
                  onClick={() =>
                    dispatch({
                      type: "check_in",
                      checkpointId: checkpoint.id,
                    })
                  }
                >
                  {collected ? "取得済み" : "デモチェックイン"}
                </button>
              )}
            </article>
          );
        })}
      </section>

      <section className={styles.coupon} aria-labelledby="coupon-title">
        <span>COMPLETE REWARD</span>
        <h2 id="coupon-title">
          {isComplete
            ? "達成クーポン獲得！"
            : `${stampCheckpoints.length}地点達成でクーポン解放`}
        </h2>
        <p>
          {isComplete
            ? "協力店舗で画面を提示してください。"
            : `あと${stampCheckpoints.length - state.stampIds.length}地点です。`}
        </p>
        {isComplete && <code>{appConfig.couponCode}</code>}
      </section>

      <section
        className={styles.notification}
        aria-labelledby="notification-title"
      >
        <div>
          <span>EVENT ALERT</span>
          <h2 id="notification-title">演奏変更を通知で受け取る</h2>
          <p>通知は利用者の操作後にだけ許可を求めます。</p>
        </div>
        <button type="button" onClick={requestNotifications}>
          {state.notificationPreference === "enabled"
            ? "通知許可済み"
            : "通知を設定"}
        </button>
        {notificationMessage && (
          <p className={styles.notificationMessage} role="status">
            {notificationMessage}
          </p>
        )}
      </section>
        </>
      )}

      <div className={styles.actions}>
        <Link href="/qr-demo">デモQRを表示</Link>
        <Link href="/">ホームへ戻る</Link>
      </div>
    </main>
  );
}
