import { describe, expect, it } from "vitest";
import { distanceMeters, evaluateCheckin } from "./checkin-guard";
import { stampCheckpoints } from "@/data/engagement";

// content.json の実データ: [1]=GREENWAY CAFÉ, [2]=南口
const cafe = stampCheckpoints[1];
const south = stampCheckpoints[2];
const start = stampCheckpoints[0];

const atCafe = {
  latitude: cafe.latitude,
  longitude: cafe.longitude,
  accuracyMeters: 20,
};

describe("checkin-guard: 距離計算", () => {
  it("駅北口と南口ゲートの距離が妥当(約2.4〜2.7km)", () => {
    const distance = distanceMeters(
      start.latitude,
      start.longitude,
      south.latitude,
      south.longitude,
    );
    expect(distance).toBeGreaterThan(2000);
    expect(distance).toBeLessThan(3000);
  });
});

describe("checkin-guard: 判定", () => {
  const baseState = {
    stampIds: [start.id],
    stampTimes: { [start.id]: new Date(Date.now() - 30 * 60_000).toISOString() },
  };

  it("現地・順序・時間がそろえば許可", () => {
    expect(
      evaluateCheckin({
        checkpoint: cafe,
        previous: start,
        state: baseState,
        position: atCafe,
        radiusMeters: 150,
      }),
    ).toEqual({ ok: true });
  });

  it("前の地点が未取得なら順序違反(SNSでGOALだけ共有されても不可)", () => {
    const verdict = evaluateCheckin({
      checkpoint: south,
      previous: cafe,
      state: baseState,
      position: {
        latitude: south.latitude,
        longitude: south.longitude,
        accuracyMeters: 10,
      },
      radiusMeters: 150,
    });
    expect(verdict).toMatchObject({ ok: false, reason: "order" });
  });

  it("物理的に不可能な速さの連続取得を拒否(ソファで連続スキャン対策)", () => {
    const verdict = evaluateCheckin({
      checkpoint: cafe,
      previous: start,
      state: {
        stampIds: [start.id],
        stampTimes: { [start.id]: new Date().toISOString() },
      },
      position: atCafe,
      radiusMeters: 150,
    });
    expect(verdict).toMatchObject({ ok: false, reason: "too_fast" });
    if (!verdict.ok && verdict.reason === "too_fast") {
      expect(verdict.waitMinutes).toBeGreaterThan(0);
    }
  });

  it("位置情報が取れない場合は拒否", () => {
    expect(
      evaluateCheckin({
        checkpoint: cafe,
        previous: start,
        state: baseState,
        position: null,
        radiusMeters: 150,
      }),
    ).toMatchObject({ ok: false, reason: "no_position" });
  });

  it("遠隔地(自宅等)からの取得を拒否", () => {
    const verdict = evaluateCheckin({
      checkpoint: cafe,
      previous: start,
      state: baseState,
      // 東京駅付近(約50km離れた場所)
      position: { latitude: 35.6812, longitude: 139.7671, accuracyMeters: 20 },
      radiusMeters: 150,
    });
    expect(verdict).toMatchObject({ ok: false, reason: "too_far" });
  });

  it("GPS精度ぶんは許容するが、上限100mを超える精度悪化は信用しない", () => {
    // 半径150m+精度20m → 160m地点はOK
    const near = evaluateCheckin({
      checkpoint: cafe,
      previous: start,
      state: baseState,
      position: {
        latitude: cafe.latitude + 0.00144, // 約160m北
        longitude: cafe.longitude,
        accuracyMeters: 20,
      },
      radiusMeters: 150,
    });
    expect(near).toEqual({ ok: true });

    // 精度5000mと主張しても、許容は+100mまで → 400m地点は拒否
    const spoofAccuracy = evaluateCheckin({
      checkpoint: cafe,
      previous: start,
      state: baseState,
      position: {
        latitude: cafe.latitude + 0.0036, // 約400m北
        longitude: cafe.longitude,
        accuracyMeters: 5000,
      },
      radiusMeters: 150,
    });
    expect(spoofAccuracy).toMatchObject({ ok: false, reason: "too_far" });
  });
});
