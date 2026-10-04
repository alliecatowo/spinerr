import type { Album, Track } from '../providers/types';
import { trendingAudius } from './audius';
import { radioByTag, radioByCountry } from './radio';
import { archiveCollection } from './archive';

export type StationKind = 'audius' | 'radio-tag' | 'radio-country' | 'archive';
export type BrowseSection = 'moods' | 'trending' | 'radio' | 'archive';

export interface Station {
  id: string;
  section: BrowseSection;
  title: string;
  subtitle: string;
  kind: StationKind;
  /** Genre, tag, country code or collection id, depending on `kind`. */
  arg: string;
}

export const SECTIONS: { id: BrowseSection; label: string; blurb: string }[] = [
  { id: 'moods', label: 'Moods', blurb: 'Pick a feeling, get a queue.' },
  { id: 'trending', label: 'Trending', blurb: 'What Audius is playing this month, by genre.' },
  { id: 'radio', label: 'Radio', blurb: 'Live internet radio, by style or country.' },
  { id: 'archive', label: 'Archive', blurb: 'Free recordings from the Internet Archive.' },
];

const audius = (section: BrowseSection, id: string, title: string, subtitle: string, arg: string): Station => ({
  id, section, title, subtitle, kind: 'audius', arg,
});

export const STATIONS: Station[] = [
  // Moods (Audius genres chosen to fit)
  audius('moods', 'mood-focus', 'Focus', 'Lo-fi beats to work to', 'Lo-Fi'),
  audius('moods', 'mood-chill', 'Chill', 'Easy and relaxed', 'Chill'),
  audius('moods', 'mood-night', 'Late night', 'Slow, dark, ambient', 'Ambient'),
  audius('moods', 'mood-energy', 'Energy', 'Electronic, fast', 'Electronic'),
  audius('moods', 'mood-dance', 'Dance floor', 'House and techno', 'House'),
  audius('moods', 'mood-mellow', 'Mellow', 'Acoustic and soft', 'Acoustic'),
  audius('moods', 'mood-groove', 'Groove', 'Funk and soul', 'Funk'),
  audius('moods', 'mood-heavy', 'Heavy', 'Rock and metal', 'Metal'),

  // Trending on Audius
  audius('trending', 'tr-all', 'Trending now', 'Everything on Audius', ''),
  audius('trending', 'tr-hiphop', 'Hip-Hop / Rap', 'Audius trending', 'Hip-Hop/Rap'),
  audius('trending', 'tr-electronic', 'Electronic', 'Audius trending', 'Electronic'),
  audius('trending', 'tr-lofi', 'Lo-Fi', 'Audius trending', 'Lo-Fi'),
  audius('trending', 'tr-pop', 'Pop', 'Audius trending', 'Pop'),
  audius('trending', 'tr-rock', 'Rock', 'Audius trending', 'Rock'),
  audius('trending', 'tr-jazz', 'Jazz', 'Audius trending', 'Jazz'),
  audius('trending', 'tr-classical', 'Classical', 'Audius trending', 'Classical'),
  audius('trending', 'tr-rnb', 'R&B / Soul', 'Audius trending', 'R&B/Soul'),
  audius('trending', 'tr-reggae', 'Reggae', 'Audius trending', 'Reggae'),
  audius('trending', 'tr-latin', 'Latin', 'Audius trending', 'Latin'),
  audius('trending', 'tr-country', 'Country', 'Audius trending', 'Country'),

  // Live radio by tag
  { id: 'rt-jazz', section: 'radio', title: 'Jazz radio', subtitle: 'Live stations', kind: 'radio-tag', arg: 'jazz' },
  { id: 'rt-lofi', section: 'radio', title: 'Lo-fi radio', subtitle: 'Live stations', kind: 'radio-tag', arg: 'lofi' },
  { id: 'rt-ambient', section: 'radio', title: 'Ambient radio', subtitle: 'Live stations', kind: 'radio-tag', arg: 'ambient' },
  { id: 'rt-classical', section: 'radio', title: 'Classical radio', subtitle: 'Live stations', kind: 'radio-tag', arg: 'classical' },
  { id: 'rt-electronic', section: 'radio', title: 'Electronic radio', subtitle: 'Live stations', kind: 'radio-tag', arg: 'electronic' },
  { id: 'rt-rock', section: 'radio', title: 'Rock radio', subtitle: 'Live stations', kind: 'radio-tag', arg: 'rock' },
  { id: 'rt-hiphop', section: 'radio', title: 'Hip-hop radio', subtitle: 'Live stations', kind: 'radio-tag', arg: 'hip hop' },
  { id: 'rt-reggae', section: 'radio', title: 'Reggae radio', subtitle: 'Live stations', kind: 'radio-tag', arg: 'reggae' },
  // ...and by country
  { id: 'rc-us', section: 'radio', title: 'United States', subtitle: 'Radio by country', kind: 'radio-country', arg: 'US' },
  { id: 'rc-gb', section: 'radio', title: 'United Kingdom', subtitle: 'Radio by country', kind: 'radio-country', arg: 'GB' },
  { id: 'rc-de', section: 'radio', title: 'Germany', subtitle: 'Radio by country', kind: 'radio-country', arg: 'DE' },
  { id: 'rc-fr', section: 'radio', title: 'France', subtitle: 'Radio by country', kind: 'radio-country', arg: 'FR' },
  { id: 'rc-jp', section: 'radio', title: 'Japan', subtitle: 'Radio by country', kind: 'radio-country', arg: 'JP' },
  { id: 'rc-br', section: 'radio', title: 'Brazil', subtitle: 'Radio by country', kind: 'radio-country', arg: 'BR' },

  // Internet Archive collections
  { id: 'ia-78', section: 'archive', title: '78 RPM records', subtitle: 'Shellac from the early 1900s', kind: 'archive', arg: '78rpm' },
  { id: 'ia-netlabels', section: 'archive', title: 'Netlabels', subtitle: 'Free independent releases', kind: 'archive', arg: 'netlabels' },
  { id: 'ia-etree', section: 'archive', title: 'Live concerts', subtitle: 'Taper-approved recordings', kind: 'archive', arg: 'etree' },
  { id: 'ia-opensource', section: 'archive', title: 'Community audio', subtitle: 'Uploaded by listeners', kind: 'archive', arg: 'opensource_audio' },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function fetchTracks(station: Station, signal?: AbortSignal): Promise<Track[]> {
  switch (station.kind) {
    case 'audius':
      return (await trendingAudius(station.arg, 40, signal, 6000)).filter((t) => t.duration >= 60 && t.duration <= 600);
    case 'radio-tag':
      return radioByTag(station.arg, 20, signal);
    case 'radio-country':
      return radioByCountry(station.arg, 20, signal);
    case 'archive':
      return archiveCollection(station.arg, 25, signal);
  }
}

/** Build a playable record (a queue) from a station. Throws if nothing is playable. */
export async function loadStation(station: Station, signal?: AbortSignal): Promise<Album> {
  const found = await fetchTracks(station, signal);
  if (found.length === 0) throw new Error('No playable tracks right now. Try another station.');
  // Moods and archive shuffle so repeat visits differ; trending and radio keep their ranking.
  const tracks = (station.section === 'moods' || station.section === 'archive' ? shuffle(found) : found).slice(0, 25);
  return {
    id: `station-${station.id}`,
    provider: tracks[0].provider,
    title: station.title,
    artist: station.subtitle,
    artworkUrl: tracks[0].artworkUrl,
    trackCount: tracks.length,
    tracks,
    duration: tracks.reduce((sum, t) => sum + t.duration, 0),
  };
}
