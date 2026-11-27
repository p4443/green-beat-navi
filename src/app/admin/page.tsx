import { Suspense } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { AdminDashboard } from "@/components/admin-dashboard";
import {
  readAuthEnv,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-auth";
import styles from "@/components/admin-dashboard.module.css";

export const metadata = {
  title: "運営コントロール",
};

function AdminLogin({ denied }: { denied: boolean }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>STAFF ONLY</span>
          <h1>運営ログイン</h1>
          <p>
            運営コントロールの利用には、許可された個人アカウントでのログインが必要です。
          </p>
        </div>
        <Link href="/" className={styles.publicLink}>
          来場者画面へ ↗
        </Link>
      </header>

      {denied && (
        <div className={styles.error} role="alert">
          このアカウントには権限がありません。管理者に連絡し、許可リストへの追加を依頼してください。
        </div>
      )}

      <section className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div>
            <span>SIGN IN</span>
            <h2>GitHubアカウントでログイン</h2>
          </div>
        </div>
        <p className={styles.loginNote}>
          パスワードの新規発行は行いません(GBN-SEC-001 3-3)。ログインは記録されます。
        </p>
        <a className={styles.loginButton} href="/api/admin/auth/login">
          GitHubでログイン
        </a>
      </section>
    </main>
  );
}

async function AdminGate({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string | string[] }>;
}) {
  // 先に cookies() へアクセスして必ずリクエスト時評価にする。
  // (ビルド時に認証未構成でも、本番の環境変数が確実に反映される)
  const cookieStore = await cookies();
  const auth = readAuthEnv();

  // 認証未構成(ローカルデモ)では従来どおり表示する
  if (!auth) {
    return <AdminDashboard demoMode session={null} />;
  }

  const session = verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
    auth.secret,
  );

  if (!session) {
    const { denied } = await searchParams;
    return <AdminLogin denied={denied === "1"} />;
  }

  return <AdminDashboard demoMode={false} session={session} />;
}

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<main className={styles.page} />}>
      <AdminGate searchParams={searchParams} />
    </Suspense>
  );
}
