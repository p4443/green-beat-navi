import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  parseAdminUsers,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "./admin-auth";

const SECRET = "test-secret-for-unit-tests";

describe("admin-auth: セッショントークン", () => {
  it("発行したトークンを検証できる", () => {
    const token = createSessionToken({ user: "p4443", role: "admin" }, SECRET);
    expect(verifySessionToken(token, SECRET)).toEqual({
      user: "p4443",
      role: "admin",
    });
  });

  it("改ざんされたトークンを拒否する", () => {
    const token = createSessionToken({ user: "p4443", role: "viewer" }, SECRET);
    const [encoded, signature] = token.split(".");
    // ペイロードを admin に書き換えても署名不一致で拒否される
    const forged = Buffer.from(
      JSON.stringify({
        user: "p4443",
        role: "admin",
        iat: 0,
        exp: Math.floor(Date.now() / 1000) + 1000,
      }),
    ).toString("base64url");
    expect(verifySessionToken(`${forged}.${signature}`, SECRET)).toBeNull();
    expect(verifySessionToken(`${encoded}.deadbeef`, SECRET)).toBeNull();
  });

  it("別の鍵で署名されたトークンを拒否する", () => {
    const token = createSessionToken({ user: "p4443", role: "admin" }, "other");
    expect(verifySessionToken(token, SECRET)).toBeNull();
  });

  it("8時間の期限切れで無効になる", () => {
    const issuedAt = Date.now();
    const token = createSessionToken(
      { user: "p4443", role: "admin" },
      SECRET,
      issuedAt,
    );
    const justBefore = issuedAt + (SESSION_MAX_AGE_SECONDS - 1) * 1000;
    const justAfter = issuedAt + (SESSION_MAX_AGE_SECONDS + 1) * 1000;
    expect(verifySessionToken(token, SECRET, justBefore)).not.toBeNull();
    expect(verifySessionToken(token, SECRET, justAfter)).toBeNull();
  });

  it("空・不正形式のトークンを拒否する", () => {
    expect(verifySessionToken(undefined, SECRET)).toBeNull();
    expect(verifySessionToken("", SECRET)).toBeNull();
    expect(verifySessionToken("not-a-token", SECRET)).toBeNull();
  });
});

describe("admin-auth: 許可リストの解析", () => {
  it("ユーザーとロールを解析し、大文字小文字を無視する", () => {
    const users = parseAdminUsers("P4443:admin, tanaka:program ,sato");
    expect(users.get("p4443")).toBe("admin");
    expect(users.get("tanaka")).toBe("program");
    // ロール省略時は閲覧のみ
    expect(users.get("sato")).toBe("viewer");
  });

  it("不正なロール指定や空エントリーを無視する", () => {
    const users = parseAdminUsers("evil:superuser,,p4443:admin");
    expect(users.has("evil")).toBe(false);
    expect(users.get("p4443")).toBe("admin");
    expect(users.size).toBe(1);
  });
});
