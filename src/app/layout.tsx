import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "@serwist/next/react";
import { LiveAnnouncement } from "@/components/live-announcement";
import { OperationsProvider } from "@/components/operations-provider";
import { EngagementProvider } from "@/components/engagement-provider";
import { appConfig } from "@/data/app";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: appConfig.appName,
    template: `%s | ${appConfig.appName}`,
  },
  description: appConfig.metaDescription,
  applicationName: appConfig.appName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: appConfig.appShortName,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: appConfig.themeColor,
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
