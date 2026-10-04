import { describe, expect, it } from 'vitest';
import { parseIcs } from '../calendar/ics';
import { mapGoogleEvents } from '../calendar/google';

const ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//test//EN
BEGIN:VEVENT
UID:one@test
DTSTAMP:20261001T000000Z
DTSTART:20261010T150000Z
DTEND:20261010T160000Z
SUMMARY:Dentist
END:VEVENT
BEGIN:VEVENT
UID:weekly@test
DTSTAMP:20261001T000000Z
DTSTART:20261005T170000Z
DTEND:20261005T173000Z
RRULE:FREQ=WEEKLY;COUNT=4
SUMMARY:Standup
ATTENDEE:mailto:a@example.com
END:VEVENT
BEGIN:VEVENT
UID:bday@test
DTSTAMP:20261001T000000Z
DTSTART;VALUE=DATE:20261012
SUMMARY:Sam's Birthday
END:VEVENT
BEGIN:VEVENT
UID:old@test
DTSTAMP:20200101T000000Z
DTSTART:20200110T150000Z
DTEND:20200110T160000Z
SUMMARY:Long ago
END:VEVENT
END:VCALENDAR`;

describe('parseIcs', () => {
  const from = new Date('2026-10-01T00:00:00Z');
  const to = new Date('2026-10-31T00:00:00Z');
  const events = parseIcs(ICS, from, to, 't');

  it('returns events in the window, sorted, and skips old ones', () => {
    expect(events).toHaveLength(6);
    expect(events.some((e) => e.title === 'Long ago')).toBe(false);
    const times = events.map((e) => e.date.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it('expands recurring events', () => {
    expect(events.filter((e) => e.title === 'Standup')).toHaveLength(4);
  });

  it('classifies types and all-day events', () => {
    expect(events.find((e) => e.title === 'Standup')?.type).toBe('meeting');
    const bday = events.find((e) => e.title.includes('Birthday'));
    expect(bday?.type).toBe('birthday');
    expect(bday?.time).toBe('All day');
  });

  it('throws on non-calendar text', () => {
    expect(() => parseIcs('<html>nope</html>', from, to)).toThrow();
  });
});

describe('mapGoogleEvents', () => {
  it('maps timed and all-day events', () => {
    const out = mapGoogleEvents([
      { id: 'a', summary: 'Lunch', start: { dateTime: '2026-10-05T12:00:00Z' }, end: { dateTime: '2026-10-05T13:00:00Z' } },
      { id: 'b', summary: 'Holiday', start: { date: '2026-10-06' } },
      { id: 'c' },
    ]);
    expect(out).toHaveLength(2);
    expect(out[1].time).toBe('All day');
  });
});
