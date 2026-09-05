export {};

declare global {
  interface Window {
    YT: typeof YT;

    onYouTubeIframeAPIReady:
      | (() => void)
      | undefined;
  }

  namespace YT {
    interface PlayerEvent {
      target: Player;
      data: number;
    }

    interface PlayerOptions {
      width?: string | number;
      height?: string | number;
      videoId?: string;

      playerVars?: {
        autoplay?: 0 | 1;
        controls?: 0 | 1;
        rel?: 0 | 1;
        modestbranding?: 0 | 1;
        playsinline?: 0 | 1;
        disablekb?: 0 | 1;
      };

      events?: {
        onReady?: (
          event: PlayerEvent
        ) => void;

        onStateChange?: (
          event: PlayerEvent
        ) => void;

        onError?: (
          event: PlayerEvent
        ) => void;
      };
    }

    class Player {
      constructor(
        elementId:
          | string
          | HTMLElement,
        options: PlayerOptions
      );

      playVideo(): void;

      pauseVideo(): void;

      seekTo(
        seconds: number,
        allowSeekAhead?: boolean
      ): void;

      loadVideoById(
        videoId: string
      ): void;

      cueVideoById(
        videoId: string
      ): void;

      getCurrentTime(): number;

      getDuration(): number;

      getPlayerState(): number;

      destroy(): void;
    }

    const PlayerState: {
      UNSTARTED: number;
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  }
}