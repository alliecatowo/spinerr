import type { CalendarEvent } from '../store';

interface GoogleEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  attendees?: unknown[];
}

export class GoogleCalendarAuthError extends Error {}

function parseStart(s?: { date?: string; dateTime?: string }): { date: Date; allDay: boolean } | null {
  if (s?.dateTime) return { date: new Date(s.dateTime), allDay: false };
  if (s?.date) {
    const [y, m, d] = s.date.split('-').map(Number);
    return { date: new Date(y, m - 1, d), allDay: true };
  }
  return null;
}

export function mapGoogleEvents(items: GoogleEvent[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const item of items) {
    const start = parseStart(item.start);
    if (!start) continue;
    const title = item.summary || 'Untitled event';
    const end = parseStart(item.end);
    const fmt = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    events.push({
      id: `google:${item.id}`,
      title,
      date: start.date,
      time: start.allDay ? 'All day' : end ? `${fmt(start.date)} – ${fmt(end.date)}` : fmt(start.date),
      type: /birthday|anniversary/i.test(title) ? 'birthday' : item.attendees?.length ? 'meeting' : 'appointment',
      description: item.description || '',
    });
  }
  return events;
}

/** Read the next 60 days from the primary calendar with a short-lived OAuth token. */
export async function fetchGoogleEvents(accessToken: string, from: Date, to: Date): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 401 || response.status === 403) {
    throw new GoogleCalendarAuthError('Google Calendar access expired. Connect again.');
  }
  if (!response.ok) throw new Error(`Google Calendar answered ${response.status}`);
  const data = (await response.json()) as { items?: GoogleEvent[] };
  return mapGoogleEvents(data.items ?? []);
}
