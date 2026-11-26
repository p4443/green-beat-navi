export type SpotCategory =
  | "start"
  | "music"
  | "food"
  | "experience"
  | "turnaround"
  | "goal";

export type EventSpot = {
  id: string;
  name: string;
  category: SpotCategory;
  categoryLabel: string;
  description: string;
  latitude: number;
  longitude: number;
  status: "open" | "scheduled";
  statusLabel: string;
  coordinateStatus: "verified" | "provisional";
};

export const demoMapCenter = {
  latitude: 36.0571,
  longitude: 139.3694,
} as const;

export const greenwayRoute = [
  [139.37421, 36.04607],
  [139.37557, 36.04725],
  [139.37569, 36.04892],
  [139.37532, 36.05054],
  [139.37486, 36.05334],
  [139.37374, 36.05585],
  [139.37182, 36.05848],
  [139.36937, 36.06068],
  [139.36726, 36.06322],
  [139.36512, 36.06563],
  [139.36303, 36.06814],
] as const;

export const eventSpots: EventSpot[] = [
  {
    id: "station-north-rotary",
    name: "START｜森林公園駅 北口ロータリー",
    category: "start",
    categoryLabel: "START",
    description: "イベントの出発地点。メイン案内とオープニングを行います。",
    latitude: 36.04607,
    longitude: 139.37421,
    status: "open",
    statusLabel: "スタート地点",
    coordinateStatus: "verified",
  },
  {
    id: "forest-session",
    name: "木陰のアンサンブル",
    category: "music",
    categoryLabel: "MUSIC",
    description: "サックスと金管の生音を楽しむ小編成ステージ。",
    latitude: 36.05054,
    longitude: 139.37532,
    status: "open",
    statusLabel: "開催中",
    coordinateStatus: "provisional",
  },
  {
    id: "green-cafe",
    name: "GREENWAY CAFÉ",
    category: "food",
    categoryLabel: "FOOD",
    description: "地元の珈琲、パン、焼き菓子を提供する休憩エリア。",
    latitude: 36.05334,
    longitude: 139.37486,
    status: "open",
    statusLabel: "営業中",
    coordinateStatus: "provisional",
  },
  {
    id: "instrument-lab",
    name: "はじめての楽器ラボ",
    category: "experience",
    categoryLabel: "EXPERIENCE",
    description: "子どもから大人まで、音を出す楽しさに出会う楽器体験。",
    latitude: 36.05848,
    longitude: 139.37182,
    status: "scheduled",
    statusLabel: "11:30開始",
    coordinateStatus: "provisional",
  },
  {
    id: "farm-market",
    name: "なめがわファームマーケット",
    category: "food",
    categoryLabel: "MARKET",
    description: "朝採れ野菜と地域の特産品を販売するマーケット。",
    latitude: 36.06068,
    longitude: 139.36937,
    status: "open",
    statusLabel: "販売中",
    coordinateStatus: "provisional",
  },
  {
    id: "south-gate",
    name: "TURN｜森林公園 南口ゲート",
    category: "turnaround",
    categoryLabel: "TURNAROUND",
    description: "往路約2.9km地点。ここで折り返して駅へ戻ります。",
    latitude: 36.06814,
    longitude: 139.36303,
    status: "open",
    statusLabel: "折返し地点",
    coordinateStatus: "verified",
  },
  {
    id: "station-north-goal",
    name: "GOAL｜森林公園駅 北口ロータリー",
    category: "goal",
    categoryLabel: "GOAL",
    description: "緑道を往復する約5.8kmの巡回コースのゴールです。",
    latitude: 36.04607,
    longitude: 139.37421,
    status: "open",
    statusLabel: "ゴール地点",
    coordinateStatus: "verified",
  },
];
