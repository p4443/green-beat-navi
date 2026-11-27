import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { auditLog, baseUrlFromHeaders, readAuthEnv, STATE_COOKIE } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = readAuthEnv();
  const baseUrl = baseUrlFromHeaders(request.headers);

  if (!auth) {
    // 認証未構成(デモモード)ではログイン不要
    return NextResponse.redirect(`${baseUrl}/admin`);
  }

  const state = randomBytes(16).toString("hex");
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", auth.clientId);
  authorizeUrl.searchParams.set(
    "redirect_uri",
    `${baseUrl}/api/admin/auth/callback`,
  );
  authorizeUrl.searchParams.set("state", state);

  auditLog("login_start", {});

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: baseUrl.startsWith("https"),
    path: "/api/admin/auth",
    maxAge: 600,
  });
  return response;
}
