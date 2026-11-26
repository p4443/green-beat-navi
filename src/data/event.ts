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

export const eventSummary = {
  dateLabel: "2027年 春／秋・調整中",
  areaLabel: "森林公園駅北口発着・南口折返し",
  admissionLabel: "入場無料（予定）",
  organizer: "埼玉県森林公園緑道",
  designatedManager: "一般社団法人埼玉県造園業協会",
} as const;

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

export const featuredPrograms: FeaturedProgram[] = [
  {
    id: "morning-green",
    time: "09:30",
    area: "緑道・木陰エリア",
    category: "MUSIC",
    title: "Morning Green Session",
    description: "珈琲とパンを片手に楽しむ、サックス四重奏の朝のステージ。",
  },
  {
    id: "instrument-experience",
    time: "11:30",
    area: "体験エリア",
    category: "EXPERIENCE",
    title: "はじめての楽器体験",
    description: "子どもから大人まで参加できる、音を出す楽しさに出会う体験。",
  },
  {
    id: "finale",
    time: "15:30",
    area: "メインステージ",
    category: "MUSIC",
    title: "GREEN BEAT 100 Grand Ensemble",
    description:
      "ブラス、サックス、地域の吹奏楽部、一般参加者が一緒につくる大合奏。",
  },
];
