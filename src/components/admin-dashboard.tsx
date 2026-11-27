"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type AnnouncementLevel,
  type CongestionLevel,
  type ScheduleStatus,
  type SpotAvailability,
} from "@/data/operations";
import { scheduleItems } from "@/data/schedule";
import { eventSpots } from "@/data/spots";
import {
  adminRoleLabels,
  permissionsForRole,
  type AdminSession,
} from "@/lib/admin-session";
import { useOperations } from "./operations-provider";
import styles from "./admin-dashboard.module.css";

const kpis = [
  { label: "アプリ利用者", value: "642", change: "+18%" },
  { label: "2地点以上回遊", value: "71%", change: "+9pt" },
  { label: "スタンプ参加", value: "318", change: "目標106%" },
  { label: "クーポン利用", value: "154", change: "48.4%" },
] as const;

export function AdminDashboard({
  demoMode,
  session,
}: {
  demoMode: boolean;
  session: AdminSession | null;
}) {
  const { state, dispatch, storageError } = useOperations();
  const [announcementLevel, setAnnouncementLevel] =
    useState<AnnouncementLevel>("info");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  // デモモード(認証未構成)では全操作可。認証時はロールに従う
  const permissions = session
    ? permissionsForRole(session.role)
    : { announce: demoMode, program: demoMode, spots: demoMode, reset: demoMode };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            {demoMode ? "PRESENTATION DEMO" : "STAFF CONSOLE"}
          </span>
          <h1>GREEN BEAT 運営コントロール</h1>
          <p>変更内容はこの端末の来場者画面へ即時反映されます。</p>
        </div>
        <div className={styles.headerActions}>
          {session && (
            <form action="/api/admin/auth/logout" method="post">
              <span className={styles.sessionBadge}>
                {session.user}({adminRoleLabels[session.role]})
              </span>
              <button className={styles.logoutButton} type="submit">
                ログアウト
              </button>
            </form>
          )}
          <Link href="/" className={styles.publicLink}>
            来場者画面を見る ↗
          </Link>
        </div>
      </header>

      {demoMode ? (
        <div className={styles.disclaimer}>
          この画面はプレゼン用のデモモードです(認証未構成)。本番公開時は環境変数の設定で個人アカウント認証が有効になります。
        </div>
      ) : (
        <div className={styles.disclaimer}>
          ロール「{session ? adminRoleLabels[session.role] : ""}
          」でログイン中。権限外の操作は無効化されています。
        </div>
      )}

      {storageError && (
        <div className={styles.error} role="alert">
          {storageError}
        </div>
      )}

      <section className={styles.kpiSection} aria-labelledby="kpi-title">
        <div className={styles.sectionHeading}>
          <div>
            <span>LIVE PERFORMANCE</span>
            <h2 id="kpi-title">当日KPI</h2>
          </div>
          <small>デモデータ</small>
        </div>
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <article key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <small>{kpi.change}</small>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="announcement-title">
        <div className={styles.sectionHeading}>
          <div>
            <span>ANNOUNCEMENT</span>
            <h2 id="announcement-title">全体告知</h2>
          </div>
          <small>{state.announcement.active ? "配信中" : "停止中"}</small>
        </div>
        <fieldset
          className={styles.rbacGroup}
          disabled={!permissions.announce}
        >
          <div className={styles.announcementForm}>
          <label>
            種別
            <select
              value={announcementLevel}
              onChange={(event) =>
                setAnnouncementLevel(event.target.value as AnnouncementLevel)
              }
            >
              <option value="info">ご案内</option>
              <option value="warning">注意</option>
              <option value="emergency">緊急</option>
            </select>
          </label>
          <label className={styles.messageField}>
            メッセージ
            <input
              value={announcementMessage}
              onChange={(event) => setAnnouncementMessage(event.target.value)}
              placeholder="例：15:30のフィナーレは予定どおり開催します"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              dispatch({
                type: "publish_announcement",
                level: announcementLevel,
                message: announcementMessage,
              });
              if (announcementMessage.trim()) {
                setAnnouncementMessage("");
              }
            }}
          >
            配信する
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => dispatch({ type: "clear_announcement" })}
          >
            停止
          </button>
          </div>
        </fieldset>
      </section>

      <section className={styles.panel} aria-labelledby="schedule-admin-title">
        <div className={styles.sectionHeading}>
          <div>
            <span>PROGRAM CONTROL</span>
            <h2 id="schedule-admin-title">タイムテーブル</h2>
          </div>
        </div>
        <fieldset className={styles.rbacGroup} disabled={!permissions.program}>
          <div className={styles.controlList}>
          {scheduleItems.map((item) => {
            const operation = state.schedule[item.id];

            return (
              <article className={styles.controlRow} key={item.id}>
                <div>
                  <strong>
                    {item.time}　{item.title}
                  </strong>
                  <small>{item.area}</small>
                </div>
                <label>
                  状態
                  <select
                    value={operation?.status ?? "on_time"}
                    onChange={(event) => {
                      const status = event.target.value as ScheduleStatus;
                      dispatch({
                        type: "set_schedule_status",
                        id: item.id,
                        status,
                        delayMinutes:
                          status === "delayed"
                            ? Math.max(operation?.delayMinutes ?? 10, 10)
                            : 0,
                      });
                    }}
                  >
                    <option value="on_time">予定どおり</option>
                    <option value="delayed">遅延</option>
                    <option value="cancelled">中止</option>
                  </select>
                </label>
                <label>
                  遅延
                  <select
                    disabled={operation?.status !== "delayed"}
                    value={operation?.delayMinutes ?? 0}
                    onChange={(event) =>
                      dispatch({
                        type: "set_schedule_status",
                        id: item.id,
                        status: "delayed",
                        delayMinutes: Number(event.target.value),
                      })
                    }
                  >
                    <option value={10}>10分</option>
                    <option value={20}>20分</option>
                    <option value={30}>30分</option>
                  </select>
                </label>
              </article>
            );
          })}
          </div>
        </fieldset>
      </section>

      <section className={styles.panel} aria-labelledby="spot-admin-title">
        <div className={styles.sectionHeading}>
          <div>
            <span>AREA CONTROL</span>
            <h2 id="spot-admin-title">スポット状況</h2>
          </div>
        </div>
        <fieldset className={styles.rbacGroup} disabled={!permissions.spots}>
          <div className={styles.controlList}>
          {eventSpots.map((spot) => {
            const operation = state.spots[spot.id];

            return (
              <article className={styles.controlRow} key={spot.id}>
                <div>
                  <strong>{spot.name}</strong>
                  <small>{spot.categoryLabel}</small>
                </div>
                <label>
                  営業
                  <select
                    value={operation?.availability ?? "open"}
                    onChange={(event) =>
                      dispatch({
                        type: "set_spot_availability",
                        id: spot.id,
                        availability: event.target.value as SpotAvailability,
                      })
                    }
                  >
                    <option value="open">営業中</option>
                    <option value="paused">一時休止</option>
                    <option value="sold_out">売切れ</option>
                  </select>
                </label>
                <label>
                  混雑
                  <select
                    value={operation?.congestion ?? "low"}
                    onChange={(event) =>
                      dispatch({
                        type: "set_congestion",
                        id: spot.id,
                        congestion: event.target.value as CongestionLevel,
                      })
                    }
                  >
                    <option value="low">空いている</option>
                    <option value="medium">やや混雑</option>
                    <option value="high">混雑</option>
                  </select>
                </label>
              </article>
            );
          })}
          </div>
        </fieldset>
      </section>

      <footer className={styles.footer}>
        <span>
          最終更新：
          {state.updatedAt === new Date(0).toISOString()
            ? "初期状態"
            : new Date(state.updatedAt).toLocaleTimeString("ja-JP")}
        </span>
        <button
          className={styles.resetButton}
          type="button"
          disabled={!permissions.reset}
          onClick={() => dispatch({ type: "reset" })}
        >
          デモ状態をリセット
        </button>
      </footer>
    </main>
  );
}
