import Room from "../models/Room.js";

const getParticipant = async (roomId, userId) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    return {
      room: null,
      participant: null,
    };
  }

  const participant = room.participants.find(
    (item) => item.userId === userId.toString()
  );

  return {
    room,
    participant,
  };
};

const isHost = (participant) => {
  return participant?.role === "host";
};

const canControlPlayback = (participant) => {
  return (
    participant?.role === "host" ||
    participant?.role === "moderator"
  );
};

const assignRole = async (roomId, hostId, targetUserId, role) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  const host = room.participants.find(
    (participant) => participant.userId === hostId.toString()
  );

  if (!isHost(host)) {
    throw new Error("Only host can assign roles");
  }

  const validRoles = ["moderator", "participant"];

  if (!validRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const targetParticipant = room.participants.find(
    (participant) => participant.userId === targetUserId.toString()
  );

  if (!targetParticipant) {
    throw new Error("Participant not found");
  }

  if (targetParticipant.userId === hostId.toString()) {
    throw new Error("Host role cannot be changed");
  }

  targetParticipant.role = role;

  await room.save();

  return room;
};

const removeParticipant = async (roomId, hostId, targetUserId) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  const host = room.participants.find(
    (participant) => participant.userId === hostId.toString()
  );

  if (!isHost(host)) {
    throw new Error("Only host can remove participants");
  }

  if (hostId.toString() === targetUserId.toString()) {
    throw new Error("Host cannot remove themselves");
  }

  const participantExists = room.participants.some(
    (participant) => participant.userId === targetUserId.toString()
  );

  if (!participantExists) {
    throw new Error("Participant not found");
  }

  room.participants = room.participants.filter(
    (participant) => participant.userId !== targetUserId.toString()
  );

  await room.save();

  return room;
};

export {
  getParticipant,
  isHost,
  canControlPlayback,
  assignRole,
  removeParticipant,
};