const YOUTUBE_VIDEO_ID_REGEX =
  /^[a-zA-Z0-9_-]{11}$/;

export const isValidYouTubeVideoId = (
  videoId: string
): boolean => {
  return YOUTUBE_VIDEO_ID_REGEX.test(videoId);
};

export const extractYouTubeVideoId = (
  url: string
): string | null => {
  const trimmedUrl = url.trim();

  if (isValidYouTubeVideoId(trimmedUrl)) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    if (
      parsedUrl.hostname === "youtu.be" ||
      parsedUrl.hostname === "www.youtu.be"
    ) {
      const videoId = parsedUrl.pathname
        .replace("/", "")
        .trim();

      return isValidYouTubeVideoId(videoId)
        ? videoId
        : null;
    }

    if (
      parsedUrl.hostname === "youtube.com" ||
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "m.youtube.com"
    ) {
      const videoId = parsedUrl.searchParams.get("v");

      return videoId && isValidYouTubeVideoId(videoId)
        ? videoId
        : null;
    }

    return null;
  } catch {
    return null;
  }
};