import content from "./content.json";

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

// スポット位置・コース・地図中心の編集は src/data/content.json で行う
// (docs/CONTENT_GUIDE.md 参照)
export const demoMapCenter: { latitude: number; longitude: number } =
  content.mapCenter;

export const greenwayRoute: [number, number][] =
  content.greenwayRoute as [number, number][];

export const eventSpots: EventSpot[] = content.eventSpots as EventSpot[];
