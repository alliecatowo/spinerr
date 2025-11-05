/**
 * YouTube Search API Proxy
 * Hides API key from client-side code
 */

import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

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

    // Get API key from environment
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Build YouTube API request
    const ytParams = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: searchParams.get('maxResults') || '25',
      key: apiKey,
    });

    // Add optional parameters
    if (searchParams.get('pageToken')) {
      ytParams.set('pageToken', searchParams.get('pageToken')!);
    }
    if (searchParams.get('order')) {
      ytParams.set('order', searchParams.get('order')!);
    }

    // Fetch from YouTube
    const response = await fetch(`${YOUTUBE_API_URL}?${ytParams.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'YouTube API error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('YouTube search proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
