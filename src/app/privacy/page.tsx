import Link from "next/link";
import shell from "../app-shell.module.css";
import { appConfig } from "@/data/app";
import { stampCheckpoints } from "@/data/engagement";

export const metadata = {
  title: "プライバシーノーティス",
};

const revisionDate = "2026年11月27日";

export default function PrivacyPage() {
  return (
    <main className={shell.page}>
      <header className={shell.header}>
        <div className={shell.headerInner}>
          <span className={shell.brand}>{appConfig.appName}</span>
          <h1>プライバシーノーティス</h1>
          <p>
            本アプリは、氏名・電話番号・メールアドレスなどの個人情報を収集しない設計です。
          </p>
        </div>
      </header>
      <div className={shell.content}>
        <h2 className={shell.sectionTitle}>取り扱うデータと利用目的</h2>
        <section className={shell.spotCard}>
          <p>
            参加時に発行される「GB-」から始まる参加IDは、個人と結びつかない匿名の識別子です。以下のデータは、スタンプラリーの進捗表示とアプリの画面表示のためだけに使用します。
          </p>
          <ul>
            <li>匿名参加ID・参加開始日時</li>
            <li>取得したスタンプ({stampCheckpoints.length}地点)</li>
            <li>プログラム・お店のお気に入り</li>
            <li>通知設定の選択状態</li>
          </ul>
        </section>

        <h2 className={shell.sectionTitle}>保存場所と保持期間</h2>
        <section className={shell.spotCard}>
          <p>
            上記のデータはすべて、お使いの端末のブラウザー内(localStorage)にのみ保存されます。運営のサーバーへ送信・集約されることはありません。
          </p>
          <p>
            保持期間はご自身で管理できます。ブラウザーの設定からこのサイトのデータを削除すると、参加IDとスタンプを含むすべてのデータが消去されます。
          </p>
        </section>

        <h2 className={shell.sectionTitle}>第三者提供・外部送信</h2>
        <section className={shell.spotCard}>
          <p>参加データを第三者へ提供することはありません。</p>
          <p>
            なお、会場マップの地図画像を表示する際に、地図の提供元である
            OpenStreetMap のサーバーへ、IPアドレス等の接続情報が技術的に送信されます。これは地図表示のためだけに行われます。
          </p>
        </section>

        <h2 className={shell.sectionTitle}>お問い合わせ</h2>
        <section className={shell.spotCard}>
          <p>
            本イベントおよびデータの取り扱いに関するお問い合わせ窓口は、開催決定にあわせてここに掲載します(現在はデモ・企画検討版のため調整中です)。
          </p>
          <p>
            今後、クーポン連携などで個人情報を取り扱う場合は、取得する項目・目的・保持期間を本ページで事前に明示し、同意をいただいてから開始します。
          </p>
        </section>

        <p className={shell.demo}>改訂日:{revisionDate}</p>
        <Link className={shell.filter} href="/join">
          参加開始へ戻る
        </Link>
      </div>
    </main>
  );
}
