import Room from "../models/Room.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_room", async ({ roomId, userId, username }) => {
      try {
        if (!roomId || !userId || !username) {
          socket.emit("error", {
            message: "roomId, userId and username are required",
          });
          return;
        }

        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit("error", {
            message: "Room not found",
          });
          return;
        }

        let participant = room.participants.find(
          (item) => item.userId === userId.toString()
        );

        if (!participant) {
          participant = {
            userId: userId.toString(),
            username: username.trim(),
            role: "participant",
          };

          room.participants.push(participant);
          await room.save();
        }

        socket.join(roomId);

        socket.data.roomId = roomId;
        socket.data.userId = userId.toString();

        socket.emit("sync_state", {
          playState: room.playState,
          currentTime: room.currentTime,
          videoId: room.videoId,
        });

        socket.to(roomId).emit("user_joined", {
          username: participant.username,
          userId: participant.userId,
          role: participant.role,
          participants: room.participants,
        });
      } catch (error) {
        console.error("Join room error:", error);

        socket.emit("error", {
          message: "Failed to join room",
        });
      }
    });

    socket.on("leave_room", async ({ roomId }) => {
      try {
        const userId = socket.data.userId;

        if (!roomId || !userId) {
          socket.emit("error", {
            message: "Room ID and user ID are required",
          });
          return;
        }

        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit("error", {
            message: "Room not found",
          });
          return;
        }

        const participant = room.participants.find(
          (item) => item.userId === userId
        );

        if (!participant) {
          socket.emit("error", {
            message: "User is not in this room",
          });
          return;
        }

        room.participants = room.participants.filter(
          (item) => item.userId !== userId
        );

        await room.save();

        socket.leave(roomId);

        io.to(roomId).emit("user_left", {
          username: participant.username,
          userId: participant.userId,
          participants: room.participants,
        });

        socket.data.roomId = null;
        socket.data.userId = null;
      } catch (error) {
        console.error("Leave room error:", error);

        socket.emit("error", {
          message: "Failed to leave room",
        });
      }
    });

    socket.on("play", async ({ currentTime } = {}) => {
      try {
        const roomId = socket.data.roomId;
        const userId = socket.data.userId;

        if (!roomId || !userId) {
          socket.emit("error", {
            message: "You are not in a room",
          });
          return;
        }

        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit("error", {
            message: "Room not found",
          });
          return;
        }

        const participant = room.participants.find(
          (item) => item.userId === userId
        );

        if (
          !participant ||
          !["host", "moderator"].includes(participant.role)
        ) {
          socket.emit("error", {
            message: "You do not have permission to control playback",
          });
          return;
        }

        room.playState = "playing";
        if (typeof currentTime === "number" && currentTime >= 0) {
          room.currentTime = currentTime;
        }
        await room.save();

        io.to(roomId).emit("sync_state", {
          playState: room.playState,
          currentTime: room.currentTime,
          videoId: room.videoId,
        });
      } catch (error) {
        console.error("Play error:", error);

        socket.emit("error", {
          message: "Failed to play video",
        });
      }
    });



    socket.on("pause", async ({ currentTime } = {}) => {
      try {
        const roomId = socket.data.roomId;
        const userId = socket.data.userId;

        if (!roomId || !userId) {
          socket.emit("error", {
            message: "You are not in a room",
          });
          return;
        }

        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit("error", {
            message: "Room not found",
          });
          return;
        }

        const participant = room.participants.find(
          (item) => item.userId === userId
        );

        if (
          !participant ||
          !["host", "moderator"].includes(participant.role)
        ) {
          socket.emit("error", {
            message: "You do not have permission to control playback",
          });
          return;
        }

        room.playState = "paused";
        if (typeof currentTime === "number" && currentTime >= 0) {
          room.currentTime = currentTime;
        }
        await room.save();

        io.to(roomId).emit("sync_state", {
          playState: room.playState,
          currentTime: room.currentTime,
          videoId: room.videoId,
        });
      } catch (error) {
        console.error("Pause error:", error);

        socket.emit("error", {
          message: "Failed to pause video",
        });
      }
    });


    socket.on("seek", async ({ time }) => {
  try {
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;

    if (!roomId || !userId) {
      socket.emit("error", {
        message: "You are not in a room",
      });
      return;
    }

    if (typeof time !== "number" || time < 0) {
      socket.emit("error", {
        message: "Invalid seek time",
      });
      return;
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      socket.emit("error", {
        message: "Room not found",
      });
      return;
    }

    const participant = room.participants.find(
      (item) => item.userId === userId
    );

    if (
      !participant ||
      !["host", "moderator"].includes(participant.role)
    ) {
      socket.emit("error", {
        message: "You do not have permission to control playback",
      });
      return;
    }

    room.currentTime = time;

    await room.save();

    io.to(roomId).emit("sync_state", {
      playState: room.playState,
      currentTime: room.currentTime,
      videoId: room.videoId,
    });
  } catch (error) {
    console.error("Seek error:", error);

    socket.emit("error", {
      message: "Failed to seek video",
    });
  }
});

socket.on("change_video", async ({ videoId }) => {
  try {
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;

    if (!roomId || !userId) {
      socket.emit("error", {
        message: "You are not in a room",
      });
      return;
    }

    if (!videoId || typeof videoId !== "string") {
      socket.emit("error", {
        message: "Valid videoId is required",
      });
      return;
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      socket.emit("error", {
        message: "Room not found",
      });
      return;
    }

    const participant = room.participants.find(
      (item) => item.userId === userId
    );

    if (!participant || !["host", "moderator"].includes(participant.role)) {
      socket.emit("error", {
        message: "You do not have permission to change the video",
      });
      return;
    }

    room.videoId = videoId.trim();
    room.currentTime = 0;
    room.playState = "paused";

    await room.save();

    io.to(roomId).emit("sync_state", {
      playState: room.playState,
      currentTime: room.currentTime,
      videoId: room.videoId,
    });
  } catch (error) {
    console.error("Change video error:", error);

    socket.emit("error", {
      message: "Failed to change video",
    });
  }
});


socket.on("assign_role", async ({ userId, role }) => {
  try {
    const roomId = socket.data.roomId;
    const hostId = socket.data.userId;

    if (!roomId || !hostId) {
      socket.emit("error", {
        message: "You are not in a room",
      });
      return;
    }

    if (!userId || !role) {
      socket.emit("error", {
        message: "userId and role are required",
      });
      return;
    }

    if (!["moderator", "participant"].includes(role)) {
      socket.emit("error", {
        message: "Invalid role",
      });
      return;
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      socket.emit("error", {
        message: "Room not found",
      });
      return;
    }

    const host = room.participants.find(
      (participant) => participant.userId === hostId
    );

    if (!host || host.role !== "host") {
      socket.emit("error", {
        message: "Only host can assign roles",
      });
      return;
    }

    const participant = room.participants.find(
      (item) => item.userId === userId
    );

    if (!participant) {
      socket.emit("error", {
        message: "Participant not found",
      });
      return;
    }

    if (participant.userId === hostId) {
      socket.emit("error", {
        message: "Host role cannot be changed",
      });
      return;
    }

    participant.role = role;

    await room.save();

    io.to(roomId).emit("role_assigned", {
      userId: participant.userId,
      username: participant.username,
      role: participant.role,
      participants: room.participants,
    });
  } catch (error) {
    console.error("Assign role error:", error);

    socket.emit("error", {
      message: "Failed to assign role",
    });
  }
});


socket.on("remove_participant", async ({ userId }) => {
  try {
    const roomId = socket.data.roomId;
    const hostId = socket.data.userId;

    if (!roomId || !hostId) {
      socket.emit("error", {
        message: "You are not in a room",
      });
      return;
    }

    if (!userId) {
      socket.emit("error", {
        message: "userId is required",
      });
      return;
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      socket.emit("error", {
        message: "Room not found",
      });
      return;
    }

    const host = room.participants.find(
      (participant) => participant.userId === hostId
    );

    if (!host || host.role !== "host") {
      socket.emit("error", {
        message: "Only host can remove participants",
      });
      return;
    }

    if (userId === hostId) {
      socket.emit("error", {
        message: "Host cannot remove themselves",
      });
      return;
    }

    const participant = room.participants.find(
      (item) => item.userId === userId
    );

    if (!participant) {
      socket.emit("error", {
        message: "Participant not found",
      });
      return;
    }

    room.participants = room.participants.filter(
      (item) => item.userId !== userId
    );

    await room.save();

    io.to(roomId).emit("participant_removed", {
      userId,
      participants: room.participants,
    });

    const socketsInRoom = await io.in(roomId).fetchSockets();

    const removedSocket = socketsInRoom.find(
      (item) => item.data.userId === userId
    );

    if (removedSocket) {
      removedSocket.leave(roomId);
      removedSocket.emit("removed_from_room", {
        message: "You have been removed from the room",
      });
    }
  } catch (error) {
    console.error("Remove participant error:", error);

    socket.emit("error", {
      message: "Failed to remove participant",
    });
  }
});

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default socketHandler;