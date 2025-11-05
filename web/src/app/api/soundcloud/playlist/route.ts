/**
 * SoundCloud Playlist Detail API Proxy
 * Server-side only - fetches full playlist with all tracks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSoundCloudServerClient } from '@/lib/soundcloud-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Query parameter "id" is required' },
        { status: 400 }
      );
    }

    // Get server-side SoundCloud client
    const client = getSoundCloudServerClient();

    // Get playlist details
    const playlist = await client.getPlaylist(parseInt(id));

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      playlist,
    });
  } catch (error) {
    console.error('SoundCloud playlist detail proxy error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        playlist: null,
      },
      { status: 500 }
    );
  }
}
