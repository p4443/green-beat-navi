// 運営操作とRBAC権限の対応(GBN-SEC-001 5-1 権限マトリクス)。
import type { OperationsAction } from "@/data/operations";
import type { AdminPermissions } from "./admin-session";

/**
 * 操作に必要な権限キーを返す。API経由で許可しない操作は null。
 */
export function permissionForAction(
  action: OperationsAction,
): keyof AdminPermissions | null {
  switch (action.type) {
    case "publish_announcement":
    case "clear_announcement":
      return "announce";
    case "set_schedule_status":
      return "program";
    case "set_spot_availability":
    case "set_congestion":
      return "spots";
    case "reset":
      return "reset";
    default:
      // replace 等の内部アクションはAPIから受け付けない
      return null;
  }
}
