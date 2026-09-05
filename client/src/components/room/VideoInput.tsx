import { FormEvent, useState } from "react";

import Button from "../common/Button";
import Input from "../common/Input";
import ErrorMessage from "../common/ErrorMessage";
import { extractYouTubeVideoId } from "../../utils/youtube";

interface VideoInputProps {
  disabled?: boolean;
  onChangeVideo: (videoId: string) => void;
}

const VideoInput = ({
  disabled = false,
  onChangeVideo,
}: VideoInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      setError(
        "Please enter a valid YouTube URL or video ID."
      );
      return;
    }

    setError(null);
    onChangeVideo(videoId);
    setUrl("");
  };

  return (
    <form
      className="video-input"
      onSubmit={handleSubmit}
    >
      <Input
        id="youtube-url"
        label="YouTube Video"
        type="text"
        placeholder="Paste a YouTube URL"
        value={url}
        onChange={(event) =>
          setUrl(event.target.value)
        }
        disabled={disabled}
      />

      <Button
        type="submit"
        disabled={disabled}
      >
        Change Video
      </Button>

      <ErrorMessage message={error} />
    </form>
  );
};

export default VideoInput;