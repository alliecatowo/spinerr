/**
 * SoundCloud Stream URL API
 * Returns the progressive MP3 stream URL for a given track ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSoundCloudServerClient } from '@/lib/soundcloud-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackIdParam = searchParams.get('trackId');

    if (!trackIdParam) {
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      );
    }

    // Parse track ID - handle formats: "soundcloud-123456", "sc-123456", and "123456"
    let trackId: number;
    if (trackIdParam.startsWith('soundcloud-')) {
      trackId = parseInt(trackIdParam.substring(11));
    } else if (trackIdParam.startsWith('sc-')) {
      trackId = parseInt(trackIdParam.substring(3));
    } else {
      trackId = parseInt(trackIdParam);
    }

    if (isNaN(trackId)) {
      return NextResponse.json(
        { error: 'Invalid track ID format' },
        { status: 400 }
      );
    }

    // Get server-side SoundCloud client
    const client = getSoundCloudServerClient();

    // Fetch stream URL
    const streamUrl = await client.getStreamUrl(trackId);

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'Stream URL not available for this track', trackId },
        { status: 404 }
      );
    }

    return NextResponse.json({
      trackId: trackIdParam,
      streamUrl,
      success: true,
    });
  } catch (error) {
    console.error('SoundCloud stream URL error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch stream URL',
        success: false,
      },
      { status: 500 }
    );
  }
}
