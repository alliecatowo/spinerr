import { mockTracks } from "@/lib/mock-data";
import { TrackView } from "./TrackView";

// Pre-render every known track so the page works in the static export
export function generateStaticParams() {
  return mockTracks.map((track) => ({ id: track.id }));
}

export const dynamicParams = false;

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackView id={id} />;
}
