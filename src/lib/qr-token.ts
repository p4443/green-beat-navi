// 署名・期限付きQRトークン(サーバー専用)。GBN-SEC-001 3-4。
// トークン形式: <有効期限epochミリ秒>.<HMAC-SHA256署名(チェックポイントID.期限)>
// - QR_SIGNING_KEYS: カンマ区切りの鍵リスト。先頭の鍵で署名し、全鍵で検証する
//   (90日ローテーション時は新鍵を先頭へ追加→移行後に旧鍵を削除=無停止切替)
// - 有効期限: JST当日の終わり+1時間(朝に印刷したQRが終日有効、翌日は自動失効)
import { createHmac, timingSafeEqual } from "node:crypto";

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const BUFFER_MS = 60 * 60 * 1000;

export function readQrKeys(): string[] | null {
  const raw = process.env.QR_SIGNING_KEYS;
  if (!raw) {
    return null;
  }
  const keys = raw
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  return keys.length > 0 ? keys : null;
}

/** JST当日末+1時間のUTCエポックミリ秒を返す。 */
export function checkpointTokenExpiry(nowMs = Date.now()): number {
  const jst = nowMs + JST_OFFSET_MS;
  const endOfDayJst = (Math.floor(jst / DAY_MS) + 1) * DAY_MS;
  return endOfDayJst - JST_OFFSET_MS + BUFFER_MS;
}

function sign(checkpointId: string, expiresAtMs: number, key: string): string {
  return createHmac("sha256", key)
    .update(`${checkpointId}.${expiresAtMs}`)
    .digest("hex");
}

export function createCheckpointToken(
  checkpointId: string,
  keys: string[],
  nowMs = Date.now(),
): string {
  const expiresAtMs = checkpointTokenExpiry(nowMs);
  return `${expiresAtMs}.${sign(checkpointId, expiresAtMs, keys[0])}`;
}

export type QrTokenResult = "valid" | "expired" | "invalid";

export function verifyCheckpointToken(
  checkpointId: string,
  token: string | undefined,
  keys: string[],
  nowMs = Date.now(),
): QrTokenResult {
  if (!token) {
    return "invalid";
  }
  const [rawExpiry, signature] = token.split(".");
  const expiresAtMs = Number(rawExpiry);
  if (!rawExpiry || !signature || !Number.isSafeInteger(expiresAtMs)) {
    return "invalid";
  }

  const signatureBuf = Buffer.from(signature, "utf8");
  const matches = keys.some((key) => {
    const expected = Buffer.from(sign(checkpointId, expiresAtMs, key), "utf8");
    return (
      signatureBuf.length === expected.length &&
      timingSafeEqual(signatureBuf, expected)
    );
  });
  if (!matches) {
    return "invalid";
  }
  return expiresAtMs > nowMs ? "valid" : "expired";
}
