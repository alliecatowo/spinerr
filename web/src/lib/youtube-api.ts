/**
 * YouTube API Client
 * Uses Next.js API proxy to hide API key
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  artist: string; // channel name
  thumbnail: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
}

export interface YouTubeSearchOptions {
  query: string;
  maxResults?: number;
  pageToken?: string;
  order?: 'relevance' | 'date' | 'rating' | 'viewCount' | 'title';
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}

/**
 * YouTube API Client
 * Communicates with Next.js API proxy to keep API key server-side
 */
export class YouTubeClient {
  private proxyUrl = '/api/youtube/search';

  /**
   * Search for music videos
   */
  async search(options: YouTubeSearchOptions): Promise<YouTubeSearchResponse> {
    try {
      const params = new URLSearchParams({
        q: options.query,
      });

      if (options.maxResults) {
        params.set('maxResults', options.maxResults.toString());
      }
      if (options.pageToken) {
        params.set('pageToken', options.pageToken);
      }
      if (options.order) {
        params.set('order', options.order);
      }

      const response = await fetch(`${this.proxyUrl}?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'YouTube search failed');
      }

      const data = await response.json();

      return {
        videos: data.items?.map((item: any) => this.normalizeVideo(item)) || [],
        nextPageToken: data.nextPageToken,
        prevPageToken: data.prevPageToken,
        totalResults: data.pageInfo?.totalResults || 0,
      };
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  }

  /**
   * Normalize YouTube API response to our interface
   */
  private normalizeVideo(item: any): YouTubeVideo {
    const snippet = item.snippet;

    // Get best quality thumbnail
    const thumbnail =
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      '';

    return {
      id: item.id.videoId,
      title: snippet.title,
      artist: snippet.channelTitle,
      thumbnail,
      description: snippet.description,
      publishedAt: snippet.publishedAt,
      channelId: snippet.channelId,
      channelTitle: snippet.channelTitle,
    };
  }

  /**
   * Get embed URL for video
   */
  getEmbedUrl(videoId: string, autoplay = false): string {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: '1',
      modestbranding: '1',
      rel: '0',
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  /**
   * Get watch URL for video
   */
  getWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}

/**
 * Create YouTube client instance
 */
export function createYouTubeClient(): YouTubeClient {
  return new YouTubeClient();
}

/**
 * Singleton instance for app-wide use
 */
let youtubeClient: YouTubeClient | null = null;

export function getYouTubeClient(): YouTubeClient {
  if (!youtubeClient) {
    youtubeClient = createYouTubeClient();
  }
  return youtubeClient;
}
