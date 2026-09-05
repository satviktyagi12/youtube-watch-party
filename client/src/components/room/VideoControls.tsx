import Button from "../common/Button";

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  disabled?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return "00:00";
  }

  const totalSeconds = Math.floor(seconds);

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const VideoControls = ({
  isPlaying,
  currentTime,
  duration,
  disabled = false,
  onPlay,
  onPause,
  onSeek,
}: VideoControlsProps) => {
  const safeDuration =
    Number.isFinite(duration) && duration > 0
      ? duration
      : 0;

  const safeCurrentTime =
    Number.isFinite(currentTime) &&
    currentTime >= 0
      ? Math.min(currentTime, safeDuration || currentTime)
      : 0;

  return (
    <div className="video-controls">
      <Button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>

      <div className="seek-control">
        <span>
          {formatTime(safeCurrentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={safeDuration || 0}
          step={0.1}
          value={safeCurrentTime}
          disabled={
            disabled || safeDuration <= 0
          }
          onChange={(event) =>
            onSeek(Number(event.target.value))
          }
          aria-label="Seek video"
        />

        <span>
          {formatTime(safeDuration)}
        </span>
      </div>
    </div>
  );
};

export default VideoControls;