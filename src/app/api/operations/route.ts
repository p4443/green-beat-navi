import { NextResponse, type NextRequest } from "next/server";
import type { OperationsAction } from "@/data/operations";
import {
  auditLog,
  readAuthEnv,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-auth";
import { permissionsForRole, type AdminSession } from "@/lib/admin-session";
import { permissionForAction } from "@/lib/operations-access";
import {
  applyOperationsAction,
  operationsStoreMode,
  readOperationsState,
} from "@/lib/operations-store";

const noStore = { "Cache-Control": "no-store" };

/** 現在の運営状態を返す(来場者画面のポーリング用・公開)。 */
export async function GET() {
  const state = await readOperationsState().catch((error) => {
    console.error("operations read failed", error);
    return null;
  });

  if (!state) {
    return NextResponse.json({ mode: "local" as const }, { headers: noStore });
  }
  return NextResponse.json(
    { mode: "server" as const, state },
    { headers: noStore },
  );
}

/** 運営操作を適用する(認証構成時はセッション+ロール必須)。 */
export async function POST(request: NextRequest) {
  if (operationsStoreMode() === "local") {
    return NextResponse.json(
      { error: "server_store_disabled" },
      { status: 409, headers: noStore },
    );
  }

  // 認証が構成されている場合はセッションとロールを検証する
  const auth = readAuthEnv();
  let session: AdminSession | null = null;
  if (auth) {
    session = verifySessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
      auth.secret,
    );
    if (!session) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401, headers: noStore },
      );
    }
  }

  let action: OperationsAction;
  try {
    const body = (await request.json()) as { action?: OperationsAction };
    if (!body.action || typeof body.action.type !== "string") {
      throw new Error("invalid body");
    }
    action = body.action;
  } catch {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400, headers: noStore },
    );
  }

  const permission = permissionForAction(action);
  if (!permission) {
    return NextResponse.json(
      { error: "action_not_allowed" },
      { status: 400, headers: noStore },
    );
  }
  if (session && !permissionsForRole(session.role)[permission]) {
    auditLog("operation_denied", {
      user: session.user,
      role: session.role,
      action: action.type,
    });
    return NextResponse.json(
      { error: "forbidden" },
      { status: 403, headers: noStore },
    );
  }

  try {
    const state = await applyOperationsAction(action);
    auditLog("operation", {
      user: session?.user ?? "(demo)",
      role: session?.role,
      action: action.type,
    });
    return NextResponse.json(
      { mode: "server" as const, state },
      { headers: noStore },
    );
  } catch (error) {
    console.error("operations write failed", error);
    return NextResponse.json(
      { error: "store_unavailable" },
      { status: 503, headers: noStore },
    );
  }
}
