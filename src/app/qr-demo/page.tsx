import { Suspense } from "react";
import { headers } from "next/headers";
import { QrGallery } from "@/components/qr-gallery";

export const metadata = {
  title: "チェックポイントQR",
};

async function RequestQrGallery() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const baseUrl = configuredUrl ?? (host ? `${protocol}://${host}` : "http://localhost:3000");

  return <QrGallery baseUrl={baseUrl} />;
}

export default function QrDemoPage() {
  return (
    <Suspense fallback={<QrGallery baseUrl="http://localhost:3000" />}>
      <RequestQrGallery />
    </Suspense>
  );
}
