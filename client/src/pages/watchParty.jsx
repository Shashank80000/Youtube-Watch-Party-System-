import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../services/api";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import VideoPlayer from "../components/videoPlayer";
import VideoControls from "../components/videoControls";
import ChangeVideo from "../components/changeVideo";
import ParticipantItem from "../components/participentsItem";
import Navbar from "../components/Navbar";


const WatchParty = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const socket = useSocket();

  const [room, setRoom] = useState(null);

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const remoteUpdateRef = useRef(false);
  const joiningRoomRef = useRef(null);

  
  const currentUserId = user?._id || user?.id;

const currentParticipant = room?.participants?.find(
  (participant) =>
    participant.userId === currentUserId?.toString()
);

const currentRole =
  currentParticipant?.role || "participant";


  // Get room data
  useEffect(() => {
    const getRoom = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/rooms/${roomId}`);

        console.log("Room response:", response.data);

        setRoom(response.data.room);
      } catch (error) {
        console.error("Get room error:", error);

        if (error.response?.status === 401) {
          navigate("/login", {
            state: { from: `/room/${roomId}` },
          });
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load room"
        );
      } finally {
        setLoading(false);
      }
    };

    getRoom();
  }, [roomId]);


  useEffect(() => {
  const joinRoom = async () => {
    if (!room || !user) return;

    if (joiningRoomRef.current === roomId) return;

    const currentUserId = (
      user._id || user.id
    ).toString();

    const alreadyParticipant = room.participants.some(
      (participant) =>
        participant.userId === currentUserId
    );

    if (alreadyParticipant) {
      joiningRoomRef.current = roomId;
      return;
    }

    joiningRoomRef.current = roomId;

    try {
      const response = await api.post(
        `/rooms/${roomId}/join`
      );

      console.log(
        "Joined room:",
        response.data
      );

      setRoom((previousRoom) => {
        if (!previousRoom) return previousRoom;

        return {
          ...previousRoom,
          participants:
            response.data.participants ||
            previousRoom.participants,
        };
      });
    } catch (error) {
      console.error(
        "Join room error:",
        error
      );

      if (error.response?.status === 401) {
        navigate("/login", {
          state: { from: `/room/${roomId}` },
        });
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to join room"
      );
      joiningRoomRef.current = null;
    }
  };

  joinRoom();
}, [room, user, roomId]);   


  // Connect and join Socket.IO room
  useEffect(() => {
    if (!room || !user) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", {
      roomId,
      userId: user._id || user.id,
      username: user.username,
    });

    return () => {
      if (socket.connected) {
        socket.emit("leave_room", {
          roomId,
        });

        socket.disconnect();
      }
    };
  }, [room?.roomId, user, roomId, socket]);

  // User joined
  useEffect(() => {
    const handleUserJoined = (data) => {
      console.log("User joined:", data);

      setRoom((previousRoom) => {
        if (!previousRoom) {
          return previousRoom;
        }

        return {
          ...previousRoom,
          participants: data.participants,
        };
      });
    };

    socket.on("user_joined", handleUserJoined);

    return () => {
      socket.off("user_joined", handleUserJoined);
    };
  }, [socket]);

  // User left
  useEffect(() => {
    const handleUserLeft = (data) => {
      console.log("User left:", data);

      setRoom((previousRoom) => {
        if (!previousRoom) {
          return previousRoom;
        }

        return {
          ...previousRoom,
          participants: data.participants,
        };
      });
    };

    socket.on("user_left", handleUserLeft);

    return () => {
      socket.off("user_left", handleUserLeft);
    };
  }, [socket]);

  // Sync state
 useEffect(() => {
  const handleSyncState = (data) => {
    console.log("Sync state:", data);

    setRoom((previousRoom) => {
      if (!previousRoom) return previousRoom;

      return {
        ...previousRoom,
          videoId: data.videoId || previousRoom.videoId,
        playState: data.playState,
        currentTime: data.currentTime,
      };
    });

    if (!player) return;

    if (data.currentTime !== undefined) {
      player.seekTo(data.currentTime, true);
    }

    if (data.playState === "playing") {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  };

  socket.on("sync_state", handleSyncState);

  return () => {
    socket.off("sync_state", handleSyncState);
  };
}, [socket, player]);


  // Role assigned
  useEffect(() => {
    const handleRoleAssigned = (data) => {
      console.log("Role assigned:", data);

      setRoom((previousRoom) => {
        if (!previousRoom) {
          return previousRoom;
        }

        return {
          ...previousRoom,
          participants: data.participants,
        };
      });
    };

    socket.on("role_assigned", handleRoleAssigned);

    return () => {
      socket.off("role_assigned", handleRoleAssigned);
    };
  }, [socket]);

  // Participant removed
  useEffect(() => {
    const handleParticipantRemoved = (data) => {
      console.log("Participant removed:", data);

      setRoom((previousRoom) => {
        if (!previousRoom) {
          return previousRoom;
        }

        return {
          ...previousRoom,
          participants: data.participants,
        };
      });
    };

    socket.on(
      "participant_removed",
      handleParticipantRemoved
    );

    return () => {
      socket.off(
        "participant_removed",
        handleParticipantRemoved
      );
    };
  }, [socket]);

  // Current user removed
  useEffect(() => {
    const handleRemovedFromRoom = (data) => {
      alert(data.message);

      navigate("/");
    };

    socket.on(
      "removed_from_room",
      handleRemovedFromRoom
    );

    return () => {
      socket.off(
        "removed_from_room",
        handleRemovedFromRoom
      );
    };
  }, [socket, navigate]);



  
  useEffect(() => {
  const handlePlay = (data) => {
    if (!player) return;

    remoteUpdateRef.current = true;

    player.seekTo(data.currentTime || 0, true);
    player.playVideo();

    setTimeout(() => {
      remoteUpdateRef.current = false;
    }, 500);
  };

  const handlePause = (data) => {
    if (!player) return;

    remoteUpdateRef.current = true;

    player.seekTo(data.currentTime || 0, true);
    player.pauseVideo();

    setTimeout(() => {
      remoteUpdateRef.current = false;
    }, 500);
  };

  const handleSeek = (data) => {
    if (!player) return;

    remoteUpdateRef.current = true;

    player.seekTo(data.currentTime || 0, true);

    setTimeout(() => {
      remoteUpdateRef.current = false;
    }, 500);
  };

  socket.on("play", handlePlay);
  socket.on("pause", handlePause);
  socket.on("seek", handleSeek);

  return () => {
    socket.off("play", handlePlay);
    socket.off("pause", handlePause);
    socket.off("seek", handleSeek);
  };
}, [socket, player]);





  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <p className="text-sm text-neutral-500">
          Loading room...
        </p>
      </div>
    );
  }


  // Error
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-neutral-900">
            Unable to load room
          </h1>

          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-5 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  


  const handlePlay = () => {
  if (!player) return;

    player.unMute();

    const playerState = player.getPlayerState();
    if (playerState === -1 || playerState === 5) {
      player.loadVideoById(room.videoId);
      player.playVideo();
    } else {
      player.playVideo();
    }

  socket.emit("play", {
    roomId,
    currentTime: player.getCurrentTime(),
  });
};

const handlePause = () => {
  if (!player) return;

  player.pauseVideo();

  socket.emit("pause", {
    roomId,
    currentTime: player.getCurrentTime(),
  });
};

const handleSeek = (time) => {
  if (!player) return;

  player.seekTo(time, true);

  socket.emit("seek", {
    roomId,
    time,
  });
};

const handleChangeVideo = (videoId) => {
  setPlayer(null);
  setRoom((previousRoom) => {
    if (!previousRoom) return previousRoom;

    return {
      ...previousRoom,
      videoId,
      playState: "paused",
      currentTime: 0,
    };
  });

  socket.emit("change_video", {
    roomId,
    videoId,
  });
};


const handleAssignRole = (userId, role) => {
  socket.emit("assign_role", {
    roomId,
    userId,
    role,
  });
};
const handleRemoveParticipant = (userId) => {
  socket.emit("remove_participant", {
    roomId,
    userId,
  });
};


const handleCopyRoomLink = async () => {
  try {
    await navigator.clipboard.writeText(
      window.location.href
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch (error) {
    console.error("Failed to copy room link:", error);
  }
};







  // Room
  return (
  <div className="min-h-screen bg-[#f7f7f5]">
      <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">
            YouTube Watch Party
          </p>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Room {room.roomId}
            </h1>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-500 ring-1 ring-neutral-200">
              {currentRole}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopyRoomLink}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            {copied ? "Copied!" : "Copy invite link"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

        {/* Video area */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">

          <VideoPlayer
            key={room.videoId || "no-video"}
            videoId={room.videoId}
            onPlayerReady={setPlayer}
          />

          <VideoControls
            player={player}
            role={currentRole}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
          />

          <ChangeVideo
            role={currentRole}
            onChangeVideo={handleChangeVideo}
          />

          <div className="border-t border-neutral-200 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Current video
            </p>

            <p className="mt-1 truncate text-sm font-medium text-neutral-900">
              {room.videoId || "No video selected"}
            </p>
          </div>
        </section>

        {/* Participants */}
        <aside className="h-fit overflow-hidden rounded-2xl border border-neutral-200 bg-white">

          <div className="border-b border-neutral-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Participants
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  {room.participants.length}{" "}
                  {room.participants.length === 1
                    ? "person"
                    : "people"}{" "}
                  in this room
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
                {room.participants.length}
              </div>
            </div>
          </div>

          <div className="p-3">
            {room.participants.map((participant) => (
              <ParticipantItem
                key={participant.userId}
                participant={participant}
                currentRole={currentRole}
                onAssignRole={handleAssignRole}
                onRemove={handleRemoveParticipant}
              />
            ))}
          </div>
        </aside>

      </div>
    </main>
  </div>
);

}
export default WatchParty;