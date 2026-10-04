import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, startOfDay } from 'date-fns';
import { useCalendarStore, type CalendarEvent } from '../store';
import { parseIcs } from './ics';
import { fetchGoogleEvents } from './google';

export interface IcsSource {
  id: string;
  url: string;
  label: string;
}

const WINDOW_DAYS = 60;

interface CalendarSourcesState {
  icsSources: IcsSource[];
  addIcsSource: (source: IcsSource) => void;
  removeIcsSource: (id: string) => void;
}

/** ICS subscription URLs are kept in this browser only. */
export const useCalendarSources = create<CalendarSourcesState>()(
  persist(
    (set) => ({
      icsSources: [],
      addIcsSource: (source) =>
        set((s) => (s.icsSources.some((x) => x.url === source.url) ? s : { icsSources: [...s.icsSources, source] })),
      removeIcsSource: (id) => set((s) => ({ icsSources: s.icsSources.filter((x) => x.id !== id) })),
    }),
    { name: 'spinerr-calendar-sources', version: 1 },
  ),
);

// Events per source, merged into the calendar store.
const bySource = new Map<string, CalendarEvent[]>();

function publish() {
  const merged = [...bySource.values()].flat().sort((a, b) => a.date.getTime() - b.date.getTime());
  useCalendarStore.getState().setEvents(merged);
}

export function dropSourceEvents(id: string) {
  bySource.delete(id);
  publish();
}

export function setSourceEvents(id: string, events: CalendarEvent[]) {
  bySource.set(id, events);
  publish();
}

function window_(): { from: Date; to: Date } {
  const from = startOfDay(new Date());
  return { from, to: addDays(from, WINDOW_DAYS) };
}

/** Fetch an ICS URL through the SSRF-protected proxy and load its events. */
export async function loadIcsUrl(source: IcsSource): Promise<number> {
  const response = await fetch(`/api/ics?url=${encodeURIComponent(source.url)}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Could not load that calendar (${response.status})`);
  }
  const { from, to } = window_();
  const events = parseIcs(await response.text(), from, to, source.id);
  setSourceEvents(source.id, events);
  return events.length;
}

/** Load a .ics file the visitor picked; it never leaves the browser. */
export async function loadIcsFile(file: File): Promise<number> {
  const { from, to } = window_();
  const id = `file-${file.name}`;
  const events = parseIcs(await file.text(), from, to, id);
  setSourceEvents(id, events);
  return events.length;
}

export async function loadGoogle(accessToken: string): Promise<number> {
  const { from, to } = window_();
  const events = await fetchGoogleEvents(accessToken, from, to);
  setSourceEvents('google', events);
  return events.length;
}

/** Reload every saved ICS subscription (called on app start). Failures are silent. */
export async function refreshSavedCalendars(): Promise<void> {
  const { icsSources } = useCalendarSources.getState();
  await Promise.allSettled(icsSources.map((s) => loadIcsUrl(s)));
}
