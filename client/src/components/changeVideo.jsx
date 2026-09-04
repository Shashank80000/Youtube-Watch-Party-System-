import { useState } from "react";
import { extractYouTubeVideoId } from "../utils/youtube";

const ChangeVideo = ({ role, onChangeVideo }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const canControl =
    role === "host" || role === "moderator";

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!canControl) return;

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    onChangeVideo(videoId);
  };

  return (
    <div className="border-t border-neutral-200 p-5">
      <h2 className="text-sm font-semibold text-neutral-900">
        Change video
      </h2>

      {canControl ? (
        <form
          onSubmit={handleSubmit}
          className="mt-3 flex gap-2"
        >
          <input
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste YouTube URL"
            className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />

          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Change
          </button>
        </form>
      ) : (
        <p className="mt-2 text-xs text-neutral-500">
          Only Host or Moderator can change the video.
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default ChangeVideo;