"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./app-nav.module.css";

const navItems = [
  { href: "/", label: "ホーム", icon: "⌂" },
  { href: "/map", label: "マップ", icon: "⌖" },
  { href: "/schedule", label: "予定", icon: "◷" },
  { href: "/spots", label: "スポット", icon: "◎" },
  { href: "/stamps", label: "スタンプ", icon: "✓" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="アプリナビゲーション">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            className={isActive ? styles.active : undefined}
            href={item.href}
            key={item.href}
            aria-current={isActive ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        );
      })}
    </nav>
  );
}
