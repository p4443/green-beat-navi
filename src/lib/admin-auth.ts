// 管理画面認証(サーバー専用)。GBN-SEC-001 3-3 に基づく。
// - パスワードは新設しない(GitHub OAuth による個人アカウントSSO+許可リスト)
// - セッションは HMAC-SHA256 署名付き・有効8時間の HttpOnly Cookie
// - パスキー(WebAuthn)はサーバー永続化(B-3)導入後に追加する
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  ADMIN_ROLES,
  type AdminRole,
  type AdminSession,
} from "./admin-session";

export const SESSION_COOKIE = "gbn_admin_session";
export const STATE_COOKIE = "gbn_oauth_state";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export type AuthEnv = {
  secret: string;
  clientId: string;
  clientSecret: string;
  users: Map<string, AdminRole>;
};

/** 認証が構成済みかを返す。未構成の場合はデモモード(従来動作)。 */
export function readAuthEnv(): AuthEnv | null {
  const secret = process.env.AUTH_SECRET;
  const clientId = process.env.ADMIN_GITHUB_CLIENT_ID;
  const clientSecret = process.env.ADMIN_GITHUB_CLIENT_SECRET;
  const users = parseAdminUsers(process.env.ADMIN_USERS ?? "");

  if (!secret || !clientId || !clientSecret || users.size === 0) {
    return null;
  }

  return { secret, clientId, clientSecret, users };
}

/**
 * 許可リストを解析する。形式: "p4443:admin,tanaka:program,sato"
 * ロール省略時は viewer。不正なロール指定は無視する。
 */
export function parseAdminUsers(value: string): Map<string, AdminRole> {
  const users = new Map<string, AdminRole>();
  for (const entry of value.split(",")) {
    const [rawUser, rawRole] = entry.split(":").map((part) => part.trim());
    if (!rawUser) {
      continue;
    }
    const role = (rawRole || "viewer") as AdminRole;
    if (!ADMIN_ROLES.includes(role)) {
      continue;
    }
    users.set(rawUser.toLowerCase(), role);
  }
  return users;
}

type TokenPayload = AdminSession & { iat: number; exp: number };

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function createSessionToken(
  session: AdminSession,
  secret: string,
  nowMs = Date.now(),
): string {
  const payload: TokenPayload = {
    ...session,
    iat: Math.floor(nowMs / 1000),
    exp: Math.floor(nowMs / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string,
  nowMs = Date.now(),
): AdminSession | null {
  if (!token) {
    return null;
  }
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }
  const expected = sign(encoded, secret);
  const sigBuf = Buffer.from(signature, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof payload.user !== "string" ||
    !ADMIN_ROLES.includes(payload.role) ||
    typeof payload.exp !== "number" ||
    payload.exp * 1000 <= nowMs
  ) {
    return null;
  }
  return { user: payload.user, role: payload.role };
}

/** 転送ヘッダーから公開ベースURLを導出する(Cloud Run 等のプロキシ対応)。 */
export function baseUrlFromHeaders(headers: Headers): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const protocol = headers.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

/** 監査イベントを構造化ログへ出力する(Cloud Run では Cloud Logging に保存される)。 */
export function auditLog(
  event: string,
  detail: Record<string, string | undefined>,
): void {
  console.log(
    JSON.stringify({
      type: "admin-audit",
      event,
      at: new Date().toISOString(),
      ...detail,
    }),
  );
}
