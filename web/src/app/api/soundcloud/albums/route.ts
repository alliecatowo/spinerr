/**
 * SoundCloud Album/Playlist Search API Proxy
 * Server-side only - searches for playlists which represent albums
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSoundCloudServerClient } from '@/lib/soundcloud-server';

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

    // Get server-side SoundCloud client
    const client = getSoundCloudServerClient();

    // Search for playlists (albums on SoundCloud are represented as playlists)
    const limit = parseInt(searchParams.get('limit') || '20');
    const playlists = await client.searchPlaylists({
      query,
      limit,
    });

    return NextResponse.json({
      albums: playlists,
      count: playlists.length,
    });
  } catch (error) {
    console.error('SoundCloud album search proxy error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        albums: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
