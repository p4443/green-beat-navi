"use client";

import { useEffect, useState } from "react";
import styles from "./connectivity-banner.module.css";

export function ConnectivityBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className={styles.banner} role="status">
      オフライン表示中です。保存済みの情報を表示しています。
    </div>
  );
}
