import content from "./content.json";

export type AppConfig = {
  appName: string;
  appShortName: string;
  appDescription: string;
  metaDescription: string;
  eventName: string;
  themeColor: string;
  backgroundColor: string;
  challengeName: string;
  distanceLabel: string;
  courseDescription: string;
  couponCode: string;
  // チェックインの現地性ガード(GBN-SEC-001 3-4 防複製)。
  // enabled=true で現在地・順序・最短移動時間の検証とデモチェックインの無効化を行う
  checkinGuard: {
    enabled: boolean;
    radiusMeters: number;
  };
  // 開催日時(ISO 8601)。未確定の間は null にする。
  // 本番で「開催前/開催中/終了」の自動切替に使用する予約項目。
  eventStartsAt: string | null;
  eventEndsAt: string | null;
};

// アプリ名・テーマ色・クーポン・開催日時の編集は src/data/content.json で行う
// (docs/CONTENT_GUIDE.md 2-6章参照)
export const appConfig: AppConfig = content.app as AppConfig;
