import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "@serwist/next/react";
import { LiveAnnouncement } from "@/components/live-announcement";
import { OperationsProvider } from "@/components/operations-provider";
import { EngagementProvider } from "@/components/engagement-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GREEN BEAT NAVI",
    template: "%s | GREEN BEAT NAVI",
  },
  description:
    "森林公園駅から緑道へ。音楽、地元の食、楽器体験をめぐる地域フェスティバル公式ナビ。",
  applicationName: "GREEN BEAT NAVI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GREEN BEAT",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#092d20",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>
        <SerwistProvider swUrl="/sw.js">
          <OperationsProvider>
            <EngagementProvider>
              <LiveAnnouncement />
              {children}
            </EngagementProvider>
          </OperationsProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
