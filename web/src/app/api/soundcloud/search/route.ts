/**
 * SoundCloud Search API Proxy
 * Server-side only - uses soundcloud.ts which requires Node.js modules
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSoundCloudServerClient, SoundCloudSearchOptions } from '@/lib/soundcloud-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Build search options
    const options: SoundCloudSearchOptions = {
      query,
      limit: parseInt(searchParams.get('limit') || '25'),
    };

    // Add optional filters
    const genre = searchParams.get('genre');
    if (genre) options.genre = genre;

    const bpmFrom = searchParams.get('bpmFrom');
    if (bpmFrom) options.bpmFrom = parseInt(bpmFrom);

    const bpmTo = searchParams.get('bpmTo');
    if (bpmTo) options.bpmTo = parseInt(bpmTo);

    const durationFrom = searchParams.get('durationFrom');
    if (durationFrom) options.durationFrom = parseInt(durationFrom);

    const durationTo = searchParams.get('durationTo');
    if (durationTo) options.durationTo = parseInt(durationTo);

    // Get server-side SoundCloud client
    const client = getSoundCloudServerClient();

    // Search for tracks
    const tracks = await client.searchTracks(options);

    return NextResponse.json({
      tracks,
      count: tracks.length,
    });
  } catch (error) {
    console.error('SoundCloud search proxy error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        tracks: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
