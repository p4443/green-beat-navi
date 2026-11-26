import { describe, expect, it } from "vitest";
import { stampCheckpoints } from "./engagement";
import { eventSummary, featuredPrograms } from "./event";
import { scheduleItems } from "./schedule";
import { demoMapCenter, eventSpots, greenwayRoute } from "./spots";

// content.json の編集ミス(座標・時刻・ID等)を自動検出する検証。
// 失敗した場合は docs/CONTENT_GUIDE.md の該当章を参照して修正する。

const TIME_PATTERN = /^\d{2}:\d{2}$/;

// 日本国内の妥当な座標範囲(編集時の桁間違い・緯度経度の取り違えを検出)
const isJapanLatitude = (value: number) => value >= 20 && value <= 46;
const isJapanLongitude = (value: number) => value >= 122 && value <= 154;

describe("content.json: 開催概要", () => {
  it("すべての項目が入力されている", () => {
    for (const [key, value] of Object.entries(eventSummary)) {
      expect(value.trim(), `eventSummary.${key} が空です`).not.toBe("");
    }
  });
});

describe("content.json: 見どころ(featuredPrograms)", () => {
  it("id が重複していない", () => {
    const ids = featuredPrograms.map((program) => program.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("時刻は HH:MM 形式、category は定義済みの値", () => {
    for (const program of featuredPrograms) {
      expect(program.time, `${program.id} の time`).toMatch(TIME_PATTERN);
      expect(
        ["MUSIC", "FOOD", "EXPERIENCE"],
        `${program.id} の category「${program.category}」は使用できません`,
      ).toContain(program.category);
      expect(program.title.trim()).not.toBe("");
    }
  });
});

describe("content.json: タイムテーブル(scheduleItems)", () => {
  it("id が重複していない", () => {
    const ids = scheduleItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("開始・終了時刻は HH:MM 形式で、開始が終了より前", () => {
    for (const item of scheduleItems) {
      expect(item.time, `${item.id} の time`).toMatch(TIME_PATTERN);
      expect(item.endTime, `${item.id} の endTime`).toMatch(TIME_PATTERN);
      expect(
        item.time < item.endTime,
        `${item.id}: 開始 ${item.time} が終了 ${item.endTime} より前になっていません`,
      ).toBe(true);
    }
  });

  it("kind は定義済みの値で、表示文言が入力されている", () => {
    for (const item of scheduleItems) {
      expect(
        ["music", "experience", "market"],
        `${item.id} の kind「${item.kind}」は使用できません`,
      ).toContain(item.kind);
      expect(item.title.trim()).not.toBe("");
      expect(item.area.trim()).not.toBe("");
      expect(item.participants.trim()).not.toBe("");
    }
  });
});

describe("content.json: スポット(eventSpots)", () => {
  it("id が重複していない", () => {
    const ids = eventSpots.map((spot) => spot.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("座標が日本国内の範囲にある(緯度経度の取り違え検出)", () => {
    for (const spot of eventSpots) {
      expect(
        isJapanLatitude(spot.latitude),
        `${spot.id}: latitude(緯度)${spot.latitude} が不正です。36.xx のような値を入れてください`,
      ).toBe(true);
      expect(
        isJapanLongitude(spot.longitude),
        `${spot.id}: longitude(経度)${spot.longitude} が不正です。139.xx のような値を入れてください`,
      ).toBe(true);
    }
  });

  it("区分・状態は定義済みの値", () => {
    for (const spot of eventSpots) {
      expect(
        ["start", "music", "food", "experience", "turnaround", "goal"],
        `${spot.id} の category「${spot.category}」は使用できません`,
      ).toContain(spot.category);
      expect(["open", "scheduled"]).toContain(spot.status);
      expect(["verified", "provisional"]).toContain(spot.coordinateStatus);
      expect(spot.name.trim()).not.toBe("");
      expect(spot.description.trim()).not.toBe("");
    }
  });
});

describe("content.json: スタンプ地点(stampCheckpoints)", () => {
  it("id が重複せず、URLに使える形式(半角英数とハイフン)", () => {
    const ids = stampCheckpoints.map((checkpoint) => checkpoint.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const checkpoint of stampCheckpoints) {
      expect(
        /^[a-z0-9-]+$/.test(checkpoint.id),
        `${checkpoint.id}: id は半角小文字英数とハイフンのみ使用できます(QRのURLになります)`,
      ).toBe(true);
    }
  });

  it("2地点以上あり、order が 1 から通し番号になっている", () => {
    expect(
      stampCheckpoints.length,
      "スタンプ地点は最低2地点(スタートとゴール)必要です",
    ).toBeGreaterThanOrEqual(2);
    stampCheckpoints.forEach((checkpoint, index) => {
      expect(
        checkpoint.order,
        `${checkpoint.id}: order は上から ${index + 1} になるよう通し番号を振り直してください`,
      ).toBe(index + 1);
    });
  });

  it("表示文言が入力されている", () => {
    for (const checkpoint of stampCheckpoints) {
      expect(checkpoint.name.trim(), `${checkpoint.id} の name`).not.toBe("");
      expect(checkpoint.role.trim(), `${checkpoint.id} の role`).not.toBe("");
      expect(
        checkpoint.description.trim(),
        `${checkpoint.id} の description`,
      ).not.toBe("");
    }
  });
});

describe("content.json: コース・地図(greenwayRoute / mapCenter)", () => {
  it("コースは2点以上で、各点は [経度, 緯度] の順", () => {
    expect(greenwayRoute.length).toBeGreaterThanOrEqual(2);
    greenwayRoute.forEach(([longitude, latitude], index) => {
      expect(
        isJapanLongitude(longitude),
        `greenwayRoute[${index}]: 1番目は経度(139.xx)です`,
      ).toBe(true);
      expect(
        isJapanLatitude(latitude),
        `greenwayRoute[${index}]: 2番目は緯度(36.xx)です`,
      ).toBe(true);
    });
  });

  it("地図の初期中心が日本国内にある", () => {
    expect(isJapanLatitude(demoMapCenter.latitude)).toBe(true);
    expect(isJapanLongitude(demoMapCenter.longitude)).toBe(true);
  });
});
