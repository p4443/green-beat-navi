import content from "./content.json";

export type ScheduleItem = {
  id: string;
  time: string;
  endTime: string;
  title: string;
  area: string;
  participants: string;
  kind: "music" | "experience" | "market";
};

// タイムテーブル(演奏曲・出演者・時刻)の編集は src/data/content.json で行う
// (docs/CONTENT_GUIDE.md 参照)
export const scheduleItems: ScheduleItem[] =
  content.scheduleItems as ScheduleItem[];
