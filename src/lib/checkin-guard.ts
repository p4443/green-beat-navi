// チェックインの現地性ガード(クライアント側判定)。GBN-SEC-001 3-4 防複製。
// SNS等でQRが共有されても、現地に行かずにスタンプを揃えられないようにする多層チェック:
//   1. 順序   : 前の地点を取得済みであること
//   2. 移動時間: 前の地点から物理的に不可能な速さの取得を拒否
//   3. 現在地 : 地点から半径内にいること(位置情報は端末内でのみ照合し送信しない)
// 判定はすべて端末内で完結する(匿名設計 GBN-SEC-001 4-1 を維持)。
import type { EngagementState, StampCheckpoint } from "@/data/engagement";

export type GuardPosition = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
};

export type GuardVerdict =
  | { ok: true }
  | { ok: false; reason: "order"; previousName: string }
  | { ok: false; reason: "too_fast"; waitMinutes: number }
  | { ok: false; reason: "no_position" }
  | { ok: false; reason: "too_far"; distanceMeters: number };

const EARTH_RADIUS_M = 6_371_000;
// GPS精度による誤判定を避けるための上限付き許容量
const MAX_ACCURACY_SLACK_M = 100;

export function distanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(latitudeB - latitudeA);
  const dLng = toRad(longitudeB - longitudeA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latitudeA)) * Math.cos(toRad(latitudeB)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function evaluateCheckin(params: {
  checkpoint: StampCheckpoint;
  previous: StampCheckpoint | null;
  state: Pick<EngagementState, "stampIds" | "stampTimes">;
  position: GuardPosition | null;
  radiusMeters: number;
  nowMs?: number;
}): GuardVerdict {
  const { checkpoint, previous, state, position, radiusMeters } = params;
  const nowMs = params.nowMs ?? Date.now();

  // 1. 順序: 直前の地点を取得済みか
  if (previous && !state.stampIds.includes(previous.id)) {
    return { ok: false, reason: "order", previousName: previous.name };
  }

  // 2. 移動時間: 前の地点の取得時刻から最短移動時間が経過しているか
  if (previous && checkpoint.minMinutesFromPrevious > 0) {
    const previousAt = state.stampTimes[previous.id];
    if (previousAt) {
      const elapsedMs = nowMs - Date.parse(previousAt);
      const requiredMs = checkpoint.minMinutesFromPrevious * 60_000;
      if (Number.isFinite(elapsedMs) && elapsedMs < requiredMs) {
        return {
          ok: false,
          reason: "too_fast",
          waitMinutes: Math.ceil((requiredMs - elapsedMs) / 60_000),
        };
      }
    }
  }

  // 3. 現在地: 地点の半径内にいるか(GPS精度ぶんは上限付きで許容)
  if (!position) {
    return { ok: false, reason: "no_position" };
  }
  const distance = distanceMeters(
    position.latitude,
    position.longitude,
    checkpoint.latitude,
    checkpoint.longitude,
  );
  const slack = Math.min(
    Math.max(position.accuracyMeters, 0),
    MAX_ACCURACY_SLACK_M,
  );
  if (distance > radiusMeters + slack) {
    return {
      ok: false,
      reason: "too_far",
      distanceMeters: Math.round(distance),
    };
  }

  return { ok: true };
}

export function guardMessage(verdict: Exclude<GuardVerdict, { ok: true }>): string {
  switch (verdict.reason) {
    case "order":
      return `先に「${verdict.previousName}」のスタンプを取得してください。`;
    case "too_fast":
      return `前の地点からの移動時間が短すぎます。約${verdict.waitMinutes}分後に現地でもう一度お試しください。`;
    case "no_position":
      return "現在地を確認できませんでした。位置情報の利用を許可して、現地でもう一度お試しください。";
    case "too_far":
      return "チェックポイントから離れた場所では受け取れません。現地でQRを読み取ってください。";
  }
}
