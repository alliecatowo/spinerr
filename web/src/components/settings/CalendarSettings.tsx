"use client";

import { useState } from "react";
import { Calendar, Upload, CheckCircle, Link2, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { connectGoogleCalendar } from "@/lib/auth";
import {
  dropSourceEvents,
  loadGoogle,
  loadIcsFile,
  loadIcsUrl,
  useCalendarSources,
} from "@/lib/calendar/sources";

function describe(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "Sign-in was cancelled.";
    return error.message;
  }
  return "Something went wrong.";
}

export function CalendarSettings() {
  const sources = useCalendarSources((s) => s.icsSources);
  const addSource = useCalendarSources((s) => s.addIcsSource);
  const removeSource = useCalendarSources((s) => s.removeIcsSource);

  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [googleCount, setGoogleCount] = useState<number | null>(null);

  const run = async (key: string, task: () => Promise<string>) => {
    setBusy(key);
    setMessage(null);
    try {
      setMessage({ kind: "ok", text: await task() });
    } catch (error) {
      setMessage({ kind: "error", text: describe(error) });
    } finally {
      setBusy(null);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    void run("url", async () => {
      const source = { id: `ics-${Date.now().toString(36)}`, url: trimmed, label: new URL(trimmed.replace(/^webcal:/i, "https:")).host };
      const count = await loadIcsUrl(source); // only saved if it loads
      addSource(source);
      setUrl("");
      return `Loaded ${count} event${count === 1 ? "" : "s"} for the next 60 days.`;
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void run("file", async () => {
      const count = await loadIcsFile(file);
      return `Loaded ${count} event${count === 1 ? "" : "s"} from ${file.name}. Files are not saved between visits.`;
    });
    e.target.value = "";
  };

  const handleGoogle = () =>
    void run("google", async () => {
      const token = await connectGoogleCalendar();
      const count = await loadGoogle(token);
      setGoogleCount(count);
      return `Connected. Loaded ${count} event${count === 1 ? "" : "s"} from Google Calendar.`;
    });

  return (
    <Card className="border-gray-200/60 dark:border-neutral-800/60" id="calendar">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          <CardTitle>Calendars</CardTitle>
        </div>
        <CardDescription>
          Show what&apos;s coming up next to your music. Nothing is shown until you add a calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url">Calendar URL</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="file">.ics file</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Paste an iCal / ICS link from Google, Apple, Outlook or any calendar. Spinnerr fetches it through its own
              server because browsers can&apos;t read it directly; the link is never logged.
            </p>
            <form onSubmit={handleAddUrl} className="space-y-2">
              <Label htmlFor="ics-url">Calendar link</Label>
              <div className="flex gap-2">
                <Input
                  id="ics-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://… or webcal://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button type="submit" disabled={!url.trim() || busy === "url"}>
                  {busy === "url" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                  Add
                </Button>
              </div>
            </form>
            {sources.length > 0 && (
              <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 text-sm dark:divide-neutral-800 dark:border-neutral-800">
                {sources.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="truncate">{s.label}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${s.label}`}
                      onClick={() => {
                        removeSource(s.id);
                        dropSourceEvents(s.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="google" className="mt-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Sign in with Google to show your primary calendar. Spinnerr asks for read-only access, keeps the token in
              memory for this visit only, and never changes your calendar.
            </p>
            {googleCount !== null ? (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900 dark:text-green-100">
                  Connected to Google Calendar ({googleCount} upcoming)
                </AlertDescription>
              </Alert>
            ) : (
              <Button onClick={handleGoogle} disabled={busy === "google"}>
                {busy === "google" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect Google Calendar
              </Button>
            )}
          </TabsContent>

          <TabsContent value="file" className="mt-4 space-y-2">
            <Label htmlFor="ical-file">iCal file</Label>
            <Input id="ical-file" type="file" accept=".ics,text/calendar" onChange={handleFile} />
            <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-neutral-500">
              <Upload className="h-3.5 w-3.5" /> Read in your browser; nothing is uploaded.
            </p>
          </TabsContent>
        </Tabs>

        {message && (
          <p role="status" className={message.kind === "ok" ? "text-sm text-green-600 dark:text-green-500" : "text-sm text-red-600 dark:text-red-400"}>
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
