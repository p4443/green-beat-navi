import Link from "next/link";
import shell from "../app-shell.module.css";

export const metadata = {
  title: "オフライン",
};

export default function OfflinePage() {
  return (
    <main className={shell.page}>
      <header className={shell.header}>
        <div className={shell.headerInner}>
          <span className={shell.brand}>GREEN BEAT NAVI</span>
          <h1>オフラインです</h1>
          <p>
            通信が戻ると最新情報を取得できます。閲覧済みのページは引き続き利用できます。
          </p>
        </div>
      </header>
      <div className={shell.content}>
        <Link className={shell.filter} href="/">
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}
