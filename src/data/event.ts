import content from "./content.json";

export type NavigationItem = {
  label: string;
  description: string;
  href: string;
  icon: string;
};

export type FeaturedProgram = {
  id: string;
  time: string;
  area: string;
  category: "MUSIC" | "FOOD" | "EXPERIENCE";
  title: string;
  description: string;
};

export type EventSummary = {
  dateLabel: string;
  areaLabel: string;
  admissionLabel: string;
  organizer: string;
  designatedManager: string;
};

// 開催概要・見どころの編集は src/data/content.json で行う(docs/CONTENT_GUIDE.md 参照)
export const eventSummary: EventSummary = content.eventSummary;

export const featuredPrograms: FeaturedProgram[] =
  content.featuredPrograms as FeaturedProgram[];

export const navigationItems: NavigationItem[] = [
  {
    label: "会場マップ",
    description: "演奏・お店・設備を探す",
    href: "/map",
    icon: "⌖",
  },
  {
    label: "タイムテーブル",
    description: "今から見られる演奏",
    href: "/schedule",
    icon: "◷",
  },
  {
    label: "お店とメニュー",
    description: "地元のおいしいもの",
    href: "/spots",
    icon: "♨",
  },
  {
    label: "スタンプ",
    description: "歩いて特典を集める",
    href: "/stamps",
    icon: "◎",
  },
];

