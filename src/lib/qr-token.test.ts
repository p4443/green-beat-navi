import { describe, expect, it } from "vitest";
import {
  checkpointTokenExpiry,
  createCheckpointToken,
  verifyCheckpointToken,
} from "./qr-token";

const KEYS = ["current-key"];

describe("qr-token: 署名と検証", () => {
  it("発行したトークンを同じ地点で検証できる", () => {
    const token = createCheckpointToken("greenway-cafe", KEYS);
    expect(verifyCheckpointToken("greenway-cafe", token, KEYS)).toBe("valid");
  });

  it("別の地点では無効になる(地点IDが署名対象)", () => {
    const token = createCheckpointToken("greenway-cafe", KEYS);
    expect(verifyCheckpointToken("south-gate-turn", token, KEYS)).toBe(
      "invalid",
    );
  });

  it("署名の改ざん・形式不正・鍵違いを拒否する", () => {
    const token = createCheckpointToken("greenway-cafe", KEYS);
    expect(
      verifyCheckpointToken("greenway-cafe", `${token.slice(0, -1)}x`, KEYS),
    ).toBe("invalid");
    expect(verifyCheckpointToken("greenway-cafe", undefined, KEYS)).toBe(
      "invalid",
    );
    expect(verifyCheckpointToken("greenway-cafe", "abc", KEYS)).toBe(
      "invalid",
    );
    expect(
      verifyCheckpointToken("greenway-cafe", token, ["other-key"]),
    ).toBe("invalid");
  });

  it("鍵ローテーション: 旧鍵で発行したトークンも移行期間中は有効", () => {
    const oldToken = createCheckpointToken("greenway-cafe", ["old-key"]);
    expect(
      verifyCheckpointToken("greenway-cafe", oldToken, ["new-key", "old-key"]),
    ).toBe("valid");
  });

  it("期限切れを検出する(翌日は自動失効)", () => {
    const issuedAt = Date.UTC(2026, 10, 27, 3, 0, 0); // JST 2026-11-27 12:00
    const token = createCheckpointToken("greenway-cafe", KEYS, issuedAt);
    // 同日中(JST 23:00 = UTC 14:00)は有効
    expect(
      verifyCheckpointToken(
        "greenway-cafe",
        token,
        KEYS,
        Date.UTC(2026, 10, 27, 14, 0, 0),
      ),
    ).toBe("valid");
    // 翌日(JST 01:30 = UTC 16:30、バッファ1時間超過後)は失効
    expect(
      verifyCheckpointToken(
        "greenway-cafe",
        token,
        KEYS,
        Date.UTC(2026, 10, 27, 16, 30, 0),
      ),
    ).toBe("expired");
  });

  it("有効期限はJST当日末+1時間になる", () => {
    // JST 2026-11-27 12:00 発行 → JST 2026-11-28 01:00(UTC 11-27 16:00)まで
    const issuedAt = Date.UTC(2026, 10, 27, 3, 0, 0);
    expect(checkpointTokenExpiry(issuedAt)).toBe(
      Date.UTC(2026, 10, 27, 16, 0, 0),
    );
  });
});
