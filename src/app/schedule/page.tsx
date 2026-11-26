import { AppNav } from "@/components/app-nav";
import { ConnectivityBanner } from "@/components/connectivity-banner";
import { LiveSchedule } from "@/components/live-schedule";
import shell from "../app-shell.module.css";
import { appConfig } from "@/data/app";

export const metadata = {
  title: "タイムテーブル",
};

export default function SchedulePage() {
  return (
    <main className={shell.page}>
      <ConnectivityBanner />
      <header className={shell.header}>
        <div className={shell.headerInner}>
          <div className={shell.topline}>
            <span className={shell.brand}>{appConfig.appName}</span>
            <span className={shell.demo}>DEMO MODE</span>
          </div>
          <h1>タイムテーブル</h1>
          <p>ブラス、サックス、吹奏楽部、一般参加者がつながる一日のプログラム。</p>
        </div>
      </header>
      <div className={shell.content}>
        <p className={shell.alert}>
          開催日時と出演団体は調整中です。現在はプレゼン用プログラムを表示しています。
        </p>
        <LiveSchedule />
      </div>
      <AppNav />
    </main>
  );
}
