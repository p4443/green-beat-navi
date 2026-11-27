// 管理画面のロール定義(クライアント・サーバー共用)
// GBN-SEC-001 3-3 / 5-1 の権限マトリクスに対応する。

export const ADMIN_ROLES = ["admin", "program", "spots", "viewer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const adminRoleLabels: Record<AdminRole, string> = {
  admin: "全体管理",
  program: "プログラム担当",
  spots: "出店担当",
  viewer: "閲覧",
};

export type AdminPermissions = {
  announce: boolean;
  program: boolean;
  spots: boolean;
  reset: boolean;
};

export function permissionsForRole(role: AdminRole): AdminPermissions {
  return {
    announce: role === "admin",
    program: role === "admin" || role === "program",
    spots: role === "admin" || role === "spots",
    reset: role === "admin",
  };
}

export type AdminSession = {
  user: string;
  role: AdminRole;
};
