
import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useYouTubePlayer } from "../../hooks/useYouTubePlayer";

interface YouTubePlayerProps {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  canControlPlayback: boolean;

  onPlay: (
    currentTime: number
  ) => void;

  onPause: (
    currentTime: number
  ) => void;

  onDurationChange?: (
    duration: number
  ) => void;
}

const YouTubePlayer = ({
  videoId,
  isPlaying,
  currentTime,
  canControlPlayback,
  onPlay,
  onPause,
  onDurationChange,
}: YouTubePlayerProps) => {
  const suppressPlayerEventsRef =
    useRef(false);

  const previousVideoIdRef =
    useRef<string | null>(videoId);

  const handlePlayerPlay =
    useCallback(
      (time: number): void => {
        if (
          suppressPlayerEventsRef.current
        ) {
          suppressPlayerEventsRef.current =
            false;

          return;
        }

        if (!canControlPlayback) {
          return;
        }

        onPlay(time);
      },
      [
        canControlPlayback,
        onPlay,
      ]
    );

  const handlePlayerPause =
    useCallback(
      (time: number): void => {
        if (
          suppressPlayerEventsRef.current
        ) {
          suppressPlayerEventsRef.current =
            false;

          return;
        }

        if (!canControlPlayback) {
          return;
        }

        onPause(time);
      },
      [
        canControlPlayback,
        onPause,
      ]
    );

  const playerControls =
    useYouTubePlayer({
      containerId:
        "youtube-player",
      videoId,
      autoplay: false,
      onPlay: handlePlayerPlay,
      onPause:
        handlePlayerPause,
      onDurationChange,
    });

  useEffect(() => {
    if (
      !playerControls.isReady
    ) {
      return;
    }

    if (
      previousVideoIdRef.current !==
      videoId
    ) {
      previousVideoIdRef.current =
        videoId;

      return;
    }

    const actualTime =
      playerControls.getCurrentTime();

    if (
      Math.abs(
        actualTime - currentTime
      ) > 0.75
    ) {
      playerControls.seek(
        currentTime
      );
    }
  }, [
    currentTime,
    videoId,
    playerControls.isReady,
    playerControls.getCurrentTime,
    playerControls.seek,
  ]);

  useEffect(() => {
    if (
      !playerControls.isReady ||
      !playerControls.player
    ) {
      return;
    }

    const playerState =
      playerControls.player.getPlayerState();

    if (
      isPlaying &&
      playerState !==
        YT.PlayerState.PLAYING
    ) {
      suppressPlayerEventsRef.current =
        true;

      playerControls.play();

      return;
    }

    if (
      !isPlaying &&
      playerState ===
        YT.PlayerState.PLAYING
    ) {
      suppressPlayerEventsRef.current =
        true;

      playerControls.pause();
    }
  }, [
    isPlaying,
    playerControls.isReady,
    playerControls.player,
    playerControls.play,
    playerControls.pause,
  ]);

  return (
    <div
      className={`youtube-player-wrapper ${
        canControlPlayback
          ? ""
          : "youtube-player-view-only"
      }`}
    >
      <div
        id="youtube-player"
        className="youtube-player"
      />
    </div>
  );
};

export default YouTubePlayer;