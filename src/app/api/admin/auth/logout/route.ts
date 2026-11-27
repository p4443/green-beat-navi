import { NextResponse, type NextRequest } from "next/server";
import {
  auditLog,
  baseUrlFromHeaders,
  readAuthEnv,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const auth = readAuthEnv();
  const baseUrl = baseUrlFromHeaders(request.headers);

  if (auth) {
    const session = verifySessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
      auth.secret,
    );
    auditLog("logout", { user: session?.user });
  }

  const response = NextResponse.redirect(`${baseUrl}/admin`, 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
