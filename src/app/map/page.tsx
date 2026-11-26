import { AppNav } from "@/components/app-nav";
import { ConnectivityBanner } from "@/components/connectivity-banner";
import { MapView } from "@/components/map-view";
import { eventSpots } from "@/data/spots";
import shell from "../app-shell.module.css";
import { appConfig } from "@/data/app";

export const metadata = {
  title: "会場マップ",
};

export default function MapPage() {
  return (
    <main className={shell.page}>
      <ConnectivityBanner />
      <header className={shell.header}>
        <div className={shell.headerInner}>
          <div className={shell.topline}>
            <span className={shell.brand}>{appConfig.appName}</span>
            <span className={shell.demo}>DEMO MODE</span>
          </div>
          <h1>会場マップ</h1>
          <p>
            {appConfig.courseDescription}
          </p>
        </div>
      </header>
      <div className={shell.content}>
        <p className={shell.alert}>
          起終点は森林公園駅北口、南口ゲートは折返し地点です。中間イベントスポットの配置はプレゼン用です。
        </p>
        <div className={shell.filters} aria-label="スポット種別">
          <span className={shell.filter}>全{eventSpots.length}スポット</span>
          <span className={shell.filter}>緑 往路</span>
          <span className={shell.filter}>橙 復路</span>
          <span className={shell.filter}>S / G 北口発着</span>
          <span className={shell.filter}>T 南口折返し</span>
        </div>
        <MapView />
      </div>
      <AppNav />
    </main>
  );
}
