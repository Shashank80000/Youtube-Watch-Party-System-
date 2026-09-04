export const extractYouTubeVideoId = (url) => {
  try {
    const parsedUrl = new URL(url.trim());

    const hostname = parsedUrl.hostname.replace("www.", "");

    // youtube.com/watch?v=VIDEO_ID
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return videoId;
      }

      // youtube.com/live/VIDEO_ID
      if (parsedUrl.pathname.startsWith("/live/")) {
        return parsedUrl.pathname.split("/")[2];
      }

      // youtube.com/shorts/VIDEO_ID
      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/")[2];
      }
    }

    // youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/")[1];
    }

    return null;
  } catch {
    return null;
  }
};