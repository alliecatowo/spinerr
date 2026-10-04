import { Music } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SOURCES = [
  { name: "Audius", detail: "Independent artists, full tracks, no account needed." },
  { name: "SoundCloud", detail: "Search and play through Spinerr's own proxy, no account needed." },
  { name: "Internet Archive", detail: "Live recordings, public-domain and Creative Commons audio." },
  { name: "Live radio", detail: "Internet radio stations from radio-browser.info." },
  { name: "Your files", detail: "Play audio from your computer. Files never leave your browser." },
];

export function MusicSourcesSettings() {
  return (
    <Card className="border-gray-200/60 dark:border-neutral-800/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <CardTitle>Music sources</CardTitle>
        </div>
        <CardDescription>
          Search merges every source into one list and quietly falls back to another copy if one fails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {SOURCES.map((s) => (
            <li key={s.name} className="flex gap-2">
              <span className="w-32 shrink-0 font-medium text-gray-900 dark:text-white">{s.name}</span>
              <span className="text-gray-600 dark:text-neutral-400">{s.detail}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
