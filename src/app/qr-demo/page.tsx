import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { QrGallery } from "@/components/qr-gallery";
import { stampCheckpoints } from "@/data/engagement";
import {
  readAuthEnv,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-auth";
import { createCheckpointToken, readQrKeys } from "@/lib/qr-token";

export const metadata = {
  title: "チェックポイントQR",
};

async function RequestQrGallery() {
  // 認証構成時は運営ログイン必須(署名トークンの公開漏えいを防ぐ)
  const auth = readAuthEnv();
  if (auth) {
    const cookieStore = await cookies();
    const session = verifySessionToken(
      cookieStore.get(SESSION_COOKIE)?.value,
      auth.secret,
    );
    if (!session) {
      redirect("/admin");
    }
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const baseUrl =
    configuredUrl ?? (host ? `${protocol}://${host}` : "http://localhost:3000");

  // 署名QR構成時: 当日有効のトークンを地点ごとに発行する
  const keys = readQrKeys();
  const tokens = keys
    ? Object.fromEntries(
        stampCheckpoints.map((checkpoint) => [
          checkpoint.id,
          createCheckpointToken(checkpoint.id, keys),
        ]),
      )
    : undefined;

  return <QrGallery baseUrl={baseUrl} tokens={tokens} />;
}

export default function QrDemoPage() {
  return (
    <Suspense fallback={<main />}>
      <RequestQrGallery />
    </Suspense>
  );
}
