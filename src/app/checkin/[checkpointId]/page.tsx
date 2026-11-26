import { CheckinCard } from "@/components/checkin-card";
import { stampCheckpoints } from "@/data/engagement";

export function generateStaticParams() {
  return stampCheckpoints.map((checkpoint) => ({
    checkpointId: checkpoint.id,
  }));
}

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ checkpointId: string }>;
}) {
  const { checkpointId } = await params;
  return <CheckinCard checkpointId={checkpointId} />;
}
