import { useEffect, useRef, useState } from "react";

const VideoPlayer = ({ videoId, canControl, onPlayerReady }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const onPlayerReadyRef = useRef(onPlayerReady);
  const [playerError, setPlayerError] = useState("");

  useEffect(() => {
    onPlayerReadyRef.current = onPlayerReady;
  }, [onPlayerReady]);

  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;
    setPlayerError("");

    const createPlayer = () => {
      if (!isMounted || !window.YT || !window.YT.Player) {
        return;
      }

      // Destroy previous player
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      if (!containerRef.current) return;

      playerRef.current = new window.YT.Player(
        containerRef.current,
        {
          videoId: videoId,

          playerVars: {
            autoplay: 0,
            controls: canControl ? 1 : 0,
            enablejsapi: 1,
            modestbranding: 1,
            origin: window.location.origin,
            rel: 0,
          },

          events: {
            onReady: (event) => {
              console.log("YouTube player ready");

              if (isMounted) {
                onPlayerReadyRef.current(event.target);
              }
            },

            onError: (event) => {
              console.error(
                "YouTube Player Error:",
                event.data
              );

              if (isMounted) {
                setPlayerError(
                  "This YouTube video cannot be played here. Try another video."
                );
              }
            },
          },
        }
      );
    };

    // YouTube API already loaded
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      // Load YouTube IFrame API
      let script = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!script) {
        script = document.createElement("script");

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async = true;

        document.body.appendChild(script);
      }

      // Wait for API
      const previousCallback =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) {
          previousCallback();
        }

        createPlayer();
      };
    }

    return () => {
      isMounted = false;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, canControl]);

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center bg-neutral-900">
        <p className="text-sm text-neutral-400">
          No video selected
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full bg-black">
      {playerError ? (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="text-sm text-neutral-300">{playerError}</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-full w-full"
        />
      )}
    </div>
  );
};

export default VideoPlayer;
