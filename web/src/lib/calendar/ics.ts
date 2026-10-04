import ICAL from 'ical.js';
import { format } from 'date-fns';
import type { CalendarEvent } from '../store';

const MAX_EVENTS = 500;
const MAX_ITERATIONS = 2000;

function eventType(title: string, hasAttendees: boolean): CalendarEvent['type'] {
  if (/birthday|anniversary/i.test(title)) return 'birthday';
  if (hasAttendees) return 'meeting';
  return 'appointment';
}

function timeLabel(start: Date, end: Date | null, allDay: boolean): string {
  if (allDay) return 'All day';
  const s = format(start, 'h:mm a');
  return end && end.getTime() !== start.getTime() ? `${s} – ${format(end, 'h:mm a')}` : s;
}

/**
 * Parse iCalendar text into events inside [from, to], expanding recurring
 * events. Throws if the text is not a valid calendar.
 */
export function parseIcs(text: string, from: Date, to: Date, sourceId = 'ics'): CalendarEvent[] {
  const root = new ICAL.Component(ICAL.parse(text));
  const events: CalendarEvent[] = [];

  for (const vevent of root.getAllSubcomponents('vevent')) {
    const event = new ICAL.Event(vevent);
    if (!event.startDate) continue;
    const title = event.summary || 'Untitled event';
    const allDay = event.startDate.isDate;
    const hasAttendees = vevent.getAllProperties('attendee').length > 0;

    const push = (start: Date, end: Date | null, key: string) => {
      if (start > to || (end ?? start) < from) return;
      events.push({
        id: `${sourceId}:${event.uid}:${key}`,
        title,
        date: start,
        time: timeLabel(start, end, allDay),
        type: eventType(title, hasAttendees),
        description: event.description || '',
      });
    };

    if (event.isRecurring()) {
      const iterator = event.iterator();
      for (let i = 0; i < MAX_ITERATIONS; i++) {
        const next = iterator.next();
        if (!next) break;
        const details = event.getOccurrenceDetails(next);
        const start = details.startDate.toJSDate();
        if (start > to) break;
        push(start, details.endDate ? details.endDate.toJSDate() : null, String(start.getTime()));
      }
    } else {
      const start = event.startDate.toJSDate();
      push(start, event.endDate ? event.endDate.toJSDate() : null, 'single');
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, MAX_EVENTS);
}
