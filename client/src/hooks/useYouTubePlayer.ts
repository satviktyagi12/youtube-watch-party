import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface UseYouTubePlayerOptions {
  containerId: string;
  videoId: string | null;
  autoplay?: boolean;
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTime: number) => void;
  onReady?: () => void;
  onDurationChange?: (duration: number) => void;
}

interface UseYouTubePlayerReturn {
  player: YT.Player | null;
  isReady: boolean;
  duration: number;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
}

let youtubeApiPromise: Promise<void> | null = null;

const loadYouTubeApi = (): Promise<void> => {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<void>((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (existingScript) {
      if (window.YT?.Player) {
        resolve();
        return;
      }

      window.onYouTubeIframeAPIReady = () => {
        resolve();
        window.onYouTubeIframeAPIReady = undefined;
      };

      return;
    }

    const script = document.createElement("script");

    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    window.onYouTubeIframeAPIReady = () => {
      resolve();
      window.onYouTubeIframeAPIReady = undefined;
    };

    document.body.appendChild(script);
  });

  return youtubeApiPromise;
};

export const useYouTubePlayer = ({
  containerId,
  videoId,
  autoplay = false,
  onPlay,
  onPause,
  onReady,
  onDurationChange,
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn => {
  const playerRef = useRef<YT.Player | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);

  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onReadyRef = useRef(onReady);
  const onDurationChangeRef = useRef(onDurationChange);

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    onPauseRef.current = onPause;
  }, [onPause]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onDurationChangeRef.current = onDurationChange;
  }, [onDurationChange]);

  useEffect(() => {
    let isMounted = true;

    const initializePlayer = async (): Promise<void> => {
      await loadYouTubeApi();

      if (
        !isMounted ||
        !videoId ||
        playerRef.current
      ) {
        return;
      }

      playerRef.current = new YT.Player(containerId, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
        },
        events: {
          onReady: () => {
            if (!isMounted) {
              return;
            }

            const player = playerRef.current;

            const playerDuration =
              player?.getDuration?.() ?? 0;

            if (
              Number.isFinite(playerDuration) &&
              playerDuration > 0
            ) {
              setDuration(playerDuration);
              onDurationChangeRef.current?.(
                playerDuration
              );
            }

            setIsReady(true);
            onReadyRef.current?.();
          },

          onStateChange: (event: YT.PlayerEvent) => {
            if (!isMounted) {
              return;
            }

            if (
              event.data === YT.PlayerState.PLAYING
            ) {
              onPlayRef.current?.(
                event.target.getCurrentTime()
              );
            }

            if (
              event.data === YT.PlayerState.PAUSED
            ) {
              onPauseRef.current?.(
                event.target.getCurrentTime()
              );
            }
          },
        },
      });
    };

    void initializePlayer();

    return () => {
      isMounted = false;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      setIsReady(false);
      setDuration(0);
    };
  }, [containerId, videoId, autoplay]);

  const play = useCallback((): void => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback((): void => {
    playerRef.current?.pauseVideo();
  }, []);

  const seek = useCallback((time: number): void => {
    playerRef.current?.seekTo(
      Math.max(0, time),
      true
    );
  }, []);

  const getCurrentTime = useCallback((): number => {
    return playerRef.current?.getCurrentTime() ?? 0;
  }, []);

  return {
    player: playerRef.current,
    isReady,
    duration,
    play,
    pause,
    seek,
    getCurrentTime,
  };
};