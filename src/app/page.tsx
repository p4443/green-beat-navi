import Link from "next/link";
import styles from "./page.module.css";
import { eventSummary, featuredPrograms, navigationItems } from "@/data/event";

export default function Home() {
  return (
    <main>
      <header className={styles.hero}>
        <nav className={styles.nav} aria-label="メインナビゲーション">
          <a className={styles.brand} href="#top" aria-label="GREEN BEAT NAVI トップ">
            <span className={styles.brandMark} aria-hidden="true">
              G
            </span>
            <span>
              <strong>GREEN BEAT</strong>
              <small>NAVI</small>
            </span>
          </a>
          <span className={styles.prototype}>2027 PREVIEW</span>
        </nav>

        <div className={styles.heroContent} id="top">
          <p className={styles.eyebrow}>NAMÉGAWA GREEN BEAT 2027</p>
          <h1>
            森へ向かう道が、
            <br />
            <em>音楽とマーケット</em>になる。
          </h1>
          <p className={styles.lead}>
            森林公園駅から緑道へ。演奏、地元の食、楽器体験をめぐる
            「歩く地域フェスティバル」の公式ナビです。
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/join">
              参加をはじめる
              <span aria-hidden="true">→</span>
            </Link>
            <a className={styles.secondaryAction} href="#today">
              今日の見どころ
            </a>
          </div>
        </div>

        <div className={styles.eventStrip} aria-label="開催概要">
          <div>
            <span>DATE</span>
            <strong>{eventSummary.dateLabel}</strong>
          </div>
          <div>
            <span>AREA</span>
            <strong>{eventSummary.areaLabel}</strong>
          </div>
          <div>
            <span>ADMISSION</span>
            <strong>{eventSummary.admissionLabel}</strong>
          </div>
        </div>
      </header>

      <aside className={styles.organizer} aria-label="主催者情報">
        <div>
          <span>主催</span>
          <strong>{eventSummary.organizer}</strong>
        </div>
        <div>
          <span>指定管理者</span>
          <strong>{eventSummary.designatedManager}</strong>
        </div>
      </aside>

      <section className={styles.quickNav} id="guide" aria-labelledby="guide-title">
        <div className={styles.sectionHeading}>
          <p>EXPLORE</p>
          <h2 id="guide-title">会場を楽しむ</h2>
        </div>
        <div className={styles.navGrid}>
          {navigationItems.map((item) => (
            <a className={styles.navCard} href={item.href} key={item.label}>
              <span className={styles.navIcon} aria-hidden="true">
                {item.icon}
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <span className={styles.arrow} aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.programs} id="today" aria-labelledby="program-title">
        <div className={styles.sectionHeading}>
          <p>TODAY&apos;S HIGHLIGHTS</p>
          <h2 id="program-title">今日の見どころ</h2>
        </div>
        <div className={styles.programList}>
          {featuredPrograms.map((program, index) => (
            <article className={styles.programCard} key={program.id}>
              <div className={styles.programNumber}>
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className={styles.programTime}>
                <strong>{program.time}</strong>
                <span>{program.area}</span>
              </div>
              <div className={styles.programDetail}>
                <span className={styles.category}>{program.category}</span>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.notice}>
          掲載内容は企画検討用の仮データです。開催日時・会場は関係機関との調整後に確定します。
        </p>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>GREEN BEAT NAVI</strong>
          <p>音楽と緑で、まちを歩こう。</p>
        </div>
        <a href="/admin">運営デモ ↗</a>
      </footer>
    </main>
  );
}
