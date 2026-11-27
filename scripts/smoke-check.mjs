#!/usr/bin/env node
// 本番公開後の動作確認スクリプト(GBN-DEP-001 の各チェックリストを自動検証)
// 使い方:
//   docker run --rm -v "$PWD":/app -w /app node:lts-alpine node scripts/smoke-check.mjs https://公開URL
// 依存パッケージ不要。FAILがあれば終了コード1。
import { readFileSync } from "node:fs";

const baseUrl = process.argv[2]?.replace(/\/$/, "");
if (!baseUrl) {
  console.error("使い方: node scripts/smoke-check.mjs <公開URL>");
  process.exit(1);
}

const content = JSON.parse(
  readFileSync(new URL("../src/data/content.json", import.meta.url), "utf8"),
);
const midCheckpoint = content.stampCheckpoints[1]?.id ?? "greenway-cafe";

const results = [];
const add = (level, name, detail) => results.push({ level, name, detail });

async function get(path, init) {
  return fetch(`${baseUrl}${path}`, { redirect: "manual", ...init });
}

// 1. 主要ページの応答
const pages = ["/", "/map", "/schedule", "/spots", "/join", "/stamps", "/privacy", "/manifest.webmanifest"];
for (const path of pages) {
  try {
    const res = await get(path);
    add(res.status === 200 ? "PASS" : "FAIL", `ページ ${path}`, `HTTP ${res.status}`);
  } catch (error) {
    add("FAIL", `ページ ${path}`, String(error));
  }
}

// 2. セキュリティヘッダー(GBN-SEC-001 3-2)
const home = await get("/");
const header = (name) => home.headers.get(name);
add(header("content-security-policy") ? "PASS" : "FAIL", "CSP(本適用)", header("content-security-policy")?.slice(0, 60) ?? "なし");
add(header("x-content-type-options") === "nosniff" ? "PASS" : "FAIL", "X-Content-Type-Options", header("x-content-type-options") ?? "なし");
add(header("referrer-policy") ? "PASS" : "FAIL", "Referrer-Policy", header("referrer-policy") ?? "なし");
add(header("permissions-policy") ? "PASS" : "FAIL", "Permissions-Policy", header("permissions-policy")?.slice(0, 50) ?? "なし");
add(!header("x-powered-by") ? "PASS" : "FAIL", "X-Powered-By 秘匿", header("x-powered-by") ?? "非公開");
const isHttps = baseUrl.startsWith("https");
add(isHttps ? "PASS" : "WARN", "HTTPS", isHttps ? "有効" : "http(本番ではCDN/Cloud RunのTLSを使用)");

// 3. 運営状態API(B-3)
try {
  const ops = await (await get("/api/operations")).json();
  add(
    ops.mode === "server" ? "PASS" : "WARN",
    "サーバー同期(OPERATIONS_STORE)",
    ops.mode === "server" ? "有効(全端末同期)" : "未設定(端末内デモ)",
  );
} catch (error) {
  add("FAIL", "サーバー同期API", String(error));
}

// 4. 管理画面認証(B-4)
const adminHtml = await (await get("/admin")).text();
if (adminHtml.includes("GitHubでログイン")) {
  add("PASS", "管理画面認証", "有効(ログイン画面を表示)");
} else if (adminHtml.includes("デモ状態をリセット") || adminHtml.includes("デモモード")) {
  add("WARN", "管理画面認証", "デモモード(本番では環境変数で有効化を推奨)");
} else {
  add("WARN", "管理画面認証", "判定不能(手動確認してください)");
}

// 5. 署名付きQR(B-2)
const checkinHtml = await (await get(`/checkin/${midCheckpoint}`)).text();
if (checkinHtml.includes("QRコードを確認できませんでした")) {
  add("PASS", "署名付きQR", "有効(トークン無しは拒否)");
} else {
  add("WARN", "署名付きQR", "未設定(本番では QR_SIGNING_KEYS の設定を推奨)");
}

// 6. 現地性ガード(content.json設定の確認)
add(
  content.app.checkinGuard?.enabled ? "PASS" : "WARN",
  "現地性ガード(checkinGuard)",
  content.app.checkinGuard?.enabled
    ? `有効(半径${content.app.checkinGuard.radiusMeters}m)`
    : "無効(本番イベントでは有効化を推奨)",
);

// 結果表示
const mark = { PASS: "✅", WARN: "⚠️ ", FAIL: "❌" };
console.log(`\n=== スモークチェック: ${baseUrl} ===\n`);
for (const { level, name, detail } of results) {
  console.log(`${mark[level]} ${level}  ${name} — ${detail}`);
}
const fails = results.filter((r) => r.level === "FAIL").length;
const warns = results.filter((r) => r.level === "WARN").length;
console.log(`\n合計: PASS ${results.length - fails - warns} / WARN ${warns} / FAIL ${fails}\n`);
if (fails > 0) {
  process.exit(1);
}
