import { AppNav } from "@/components/app-nav";
import { ConnectivityBanner } from "@/components/connectivity-banner";
import { LiveSpots } from "@/components/live-spots";
import shell from "../app-shell.module.css";

export const metadata = {
  title: "スポット一覧",
};

export default function SpotsPage() {
  return (
    <main className={shell.page}>
      <ConnectivityBanner />
      <header className={shell.header}>
        <div className={shell.headerInner}>
          <div className={shell.topline}>
            <span className={shell.brand}>GREEN BEAT NAVI</span>
            <span className={shell.demo}>DEMO MODE</span>
          </div>
          <h1>スポット</h1>
          <p>音楽、食、体験をめぐりながら、緑道で自分だけの一日をつくります。</p>
        </div>
      </header>
      <div className={shell.content}>
        <p className={shell.alert}>
          出店者名と配置は仮情報です。正式決定後に管理画面から更新できる設計へ移行します。
        </p>
        <LiveSpots />
      </div>
      <AppNav />
    </main>
  );
}
