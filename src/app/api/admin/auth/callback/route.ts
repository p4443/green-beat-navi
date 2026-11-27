import { NextResponse, type NextRequest } from "next/server";
import {
  auditLog,
  baseUrlFromHeaders,
  createSessionToken,
  readAuthEnv,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  STATE_COOKIE,
} from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = readAuthEnv();
  const baseUrl = baseUrlFromHeaders(request.headers);

  if (!auth) {
    return NextResponse.redirect(`${baseUrl}/admin`);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  const denied = (reason: string, user?: string) => {
    auditLog("login_denied", { reason, user });
    const response = NextResponse.redirect(`${baseUrl}/admin?denied=1`);
    response.cookies.delete(STATE_COOKIE);
    return response;
  };

  if (!code || !state || !expectedState || state !== expectedState) {
    return denied("state_mismatch");
  }

  // 認可コードをアクセストークンへ交換
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: auth.clientId,
        client_secret: auth.clientSecret,
        code,
        redirect_uri: `${baseUrl}/api/admin/auth/callback`,
      }),
    },
  );
  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
  };
  if (!tokenData.access_token) {
    return denied("token_exchange_failed");
  }

  // GitHub ユーザー名を取得し、許可リストと照合
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const userData = (await userResponse.json()) as { login?: string };
  const login = userData.login?.toLowerCase();
  if (!login) {
    return denied("user_fetch_failed");
  }

  const role = auth.users.get(login);
  if (!role) {
    return denied("not_in_allowlist", login);
  }

  auditLog("login_success", { user: login, role });

  const response = NextResponse.redirect(`${baseUrl}/admin`);
  response.cookies.delete(STATE_COOKIE);
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken({ user: login, role }, auth.secret),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: baseUrl.startsWith("https"),
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  );
  return response;
}
