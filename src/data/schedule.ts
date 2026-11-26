export type ScheduleItem = {
  id: string;
  time: string;
  endTime: string;
  title: string;
  area: string;
  participants: string;
  kind: "music" | "experience" | "market";
};

export const scheduleItems: ScheduleItem[] = [
  {
    id: "opening",
    time: "09:30",
    endTime: "10:00",
    title: "Morning Green Session",
    area: "木陰のアンサンブル",
    participants: "サックス・アンサンブル",
    kind: "music",
  },
  {
    id: "promenade",
    time: "10:30",
    endTime: "11:10",
    title: "Promenade Brass & Sax",
    area: "緑道サテライト",
    participants: "ブラス＆サックス・コレクティブ",
    kind: "music",
  },
  {
    id: "instrument",
    time: "11:30",
    endTime: "12:10",
    title: "はじめての楽器体験",
    area: "体験エリア",
    participants: "地域演奏家・吹奏楽部",
    kind: "experience",
  },
  {
    id: "school-stage",
    time: "13:30",
    endTime: "14:10",
    title: "まちの吹奏楽ステージ",
    area: "メインステージ",
    participants: "地域の吹奏楽部（参加調整中）",
    kind: "music",
  },
  {
    id: "open-rehearsal",
    time: "14:30",
    endTime: "15:10",
    title: "Grand Ensemble 公開リハーサル",
    area: "メインステージ",
    participants: "フィナーレ参加者",
    kind: "music",
  },
  {
    id: "finale",
    time: "15:30",
    endTime: "16:00",
    title: "GREEN BEAT 100 Grand Ensemble",
    area: "メインステージ",
    participants: "ブラス・サックス・吹奏楽部・一般参加者",
    kind: "music",
  },
];
