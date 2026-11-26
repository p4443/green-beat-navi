import { AppNav } from "@/components/app-nav";
import { StampDashboard } from "@/components/stamp-dashboard";

export const metadata = {
  title: "デジタルスタンプ",
};

export default function StampsPage() {
  return (
    <>
      <StampDashboard />
      <AppNav />
    </>
  );
}
