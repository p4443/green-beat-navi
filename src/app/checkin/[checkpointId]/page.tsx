import { Suspense } from "react";
import Link from "next/link";
import { CheckinCard } from "@/components/checkin-card";
import { stampCheckpoints } from "@/data/engagement";
import {
  readQrKeys,
  verifyCheckpointToken,
  type QrTokenResult,
} from "@/lib/qr-token";
import styles from "@/components/checkin-card.module.css";

export function generateStaticParams() {
  return stampCheckpoints.map((checkpoint) => ({
    checkpointId: checkpoint.id,
  }));
}

function QrRejected({ result }: { result: Exclude<QrTokenResult, "valid"> }) {
  const expired = result === "expired";
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span>{expired ? "EXPIRED QR" : "INVALID QR"}</span>
        <h1>
          {expired
            ? "このQRは有効期限切れです"
            : "QRコードを確認できませんでした"}
        </h1>
        <p>
          {expired
            ? "掲示されているQRが本日のものか、お近くのスタッフへご確認ください。"
            : "会場に掲示されている公式のQRコードを読み取ってください。"}
        </p>
        <Link href="/stamps">スタンプ台紙へ戻る</Link>
        <Link href="/">ホームへ戻る</Link>
      </section>
    </main>
  );
}

async function CheckinGate({
  params,
  searchParams,
}: {
  params: Promise<{ checkpointId: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const { checkpointId } = await params;
  // 先に searchParams へアクセスして必ずリクエスト時評価にする
  // (ビルド時に鍵未設定でも、本番の QR_SIGNING_KEYS が確実に反映される)
  const { t } = await searchParams;
  const keys = readQrKeys();

  // 署名QRが未構成(ローカルデモ)では従来どおり表示する
  if (!keys) {
    return <CheckinCard checkpointId={checkpointId} />;
  }

  const token = Array.isArray(t) ? t[0] : t;
  const result = verifyCheckpointToken(checkpointId, token, keys);

  if (result !== "valid") {
    return <QrRejected result={result} />;
  }

  return <CheckinCard checkpointId={checkpointId} />;
}

export default function CheckinPage({
  params,
  searchParams,
}: PageProps<"/checkin/[checkpointId]">) {
  return (
    <Suspense fallback={<main className={styles.page} />}>
      <CheckinGate params={params} searchParams={searchParams} />
    </Suspense>
  );
}
