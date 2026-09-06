const VideoControls = ({
  player,
  role,
  onPlay,
  onPause,
  onSeek,
}) => {
  const canControl =
    role === "host" || role === "moderator";

  const handleSeek = (event) => {
    const time = Number(event.target.value);

    if (!player || !canControl) return;

    player.seekTo(time, true);
    onSeek(time);
  };

  const currentTime = player
    ? Math.floor(player.getCurrentTime())
    : 0;

  const duration = player
    ? Math.floor(player.getDuration())
    : 0;

  if (!canControl) {
    return (
      <div className="border-t border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        Viewer mode: playback is controlled by the host or moderator.
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onPlay}
          disabled={!player}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Play
        </button>

        <button
          onClick={onPause}
          disabled={!player}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pause
        </button>

        <span className="ml-auto text-xs text-neutral-500">
          You can control playback
        </span>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          disabled={!player}
          className="w-full cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default VideoControls;