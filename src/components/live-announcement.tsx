"use client";

import { useOperations } from "./operations-provider";
import styles from "./live-announcement.module.css";

export function LiveAnnouncement() {
  const { state } = useOperations();

  if (!state.announcement.active) {
    return null;
  }

  return (
    <aside
      className={`${styles.banner} ${styles[state.announcement.level]}`}
      role={state.announcement.level === "emergency" ? "alert" : "status"}
    >
      <strong>
        {state.announcement.level === "emergency"
          ? "緊急案内"
          : state.announcement.level === "warning"
            ? "運営からのお知らせ"
            : "ご案内"}
      </strong>
      <span>{state.announcement.message}</span>
    </aside>
  );
}
