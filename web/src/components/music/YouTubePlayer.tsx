"use client";

import { useEffect, useRef, useState } from "react";

// Declare YouTube global types
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onError?: (error: number) => void;
  className?: string;
}

/**
 * YouTube IFrame Player Component
 * Wraps YouTube IFrame API in a React component
 */
export function YouTubePlayer({
  videoId,
  autoplay = false,
  onReady,
  onStateChange,
  onError,
  className = "",
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
      return;
    }

    // Load API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';

    window.onYouTubeIframeAPIReady = () => {
      setIsAPIReady(true);
    };

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(tag, firstScript);
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isAPIReady || !containerRef.current || playerRef.current) {
      return;
    }

    const player = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          playerRef.current = event.target;
          onReady?.();
        },
        onStateChange: (event) => {
          onStateChange?.(event.data);
        },
        onError: (event) => {
          onError?.(event.data);
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isAPIReady, videoId, autoplay, onReady, onStateChange, onError]);

  // Update video when videoId changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      if (autoplay) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.cueVideoById(videoId);
      }
    }
  }, [videoId, autoplay]);

  return (
    <div
      ref={containerRef}
      className={`youtube-player ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/**
 * Hook to control YouTube player
 */
export function useYouTubePlayer(playerRef: React.RefObject<YT.Player | null>) {
  const play = () => {
    playerRef.current?.playVideo();
  };

  const pause = () => {
    playerRef.current?.pauseVideo();
  };

  const stop = () => {
    playerRef.current?.stopVideo();
  };

  const seekTo = (seconds: number, allowSeekAhead = true) => {
    playerRef.current?.seekTo(seconds, allowSeekAhead);
  };

  const setVolume = (volume: number) => {
    playerRef.current?.setVolume(Math.max(0, Math.min(100, volume)));
  };

  const mute = () => {
    playerRef.current?.mute();
  };

  const unMute = () => {
    playerRef.current?.unMute();
  };

  const isMuted = (): boolean => {
    return playerRef.current?.isMuted() || false;
  };

  const getVolume = (): number => {
    return playerRef.current?.getVolume() || 0;
  };

  const getCurrentTime = (): number => {
    return playerRef.current?.getCurrentTime() || 0;
  };

  const getDuration = (): number => {
    return playerRef.current?.getDuration() || 0;
  };

  const getPlayerState = (): number => {
    return playerRef.current?.getPlayerState() || -1;
  };

  return {
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    mute,
    unMute,
    isMuted,
    getVolume,
    getCurrentTime,
    getDuration,
    getPlayerState,
  };
}

/**
 * YouTube Player States
 */
export const YouTubePlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;
