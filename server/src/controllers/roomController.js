import Room from "../models/Room.js";
import User from "../models/User.js";
import generateRoomId from "../utils/genratedRoomId.js";
import {
  assignRole,
  removeParticipant,
} from "../services/roomServices.js";

const createRoom = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const roomId = generateRoomId();

    const room = await Room.create({
      roomId,
      participants: [
        {
          userId: user._id.toString(),
          username: user.username,
          role: "host",
        },
      ],
    });

    res.status(201).json({
      message: "Room created successfully",
      roomId: room.roomId,
      userId: user._id,
      username: user.username,
      role: "host",
    });
  } catch (error) {
    console.error("Create room error:", error);

    res.status(500).json({
      message: "Failed to create room",
    });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const alreadyJoined = room.participants.some(
      (participant) => participant.userId === user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(200).json({
        message: "User is already in the room",
        roomId: room.roomId,
        participants: room.participants,
      });
    }

    room.participants.push({
      userId: user._id.toString(),
      username: user.username,
      role: "participant",
    });

    await room.save();

    res.status(200).json({
      message: "Joined room successfully",
      roomId: room.roomId,
      userId: user._id,
      username: user.username,
      role: "participant",
      participants: room.participants,
    });
  } catch (error) {
    console.error("Join room error:", error);

    res.status(500).json({
      message: "Failed to join room",
    });
  }
};

const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.status(200).json({
      room,
    });
  } catch (error) {
    console.error("Get room error:", error);

    res.status(500).json({
      message: "Failed to get room",
    });
  }
};


const assignParticipantRole = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const { role } = req.body;

    const room = await assignRole(
      roomId,
      req.userId,
      userId,
      role
    );

    const participant = room.participants.find(
      (item) => item.userId === userId
    );

    res.status(200).json({
      message: "Role assigned successfully",
      participant,
      participants: room.participants,
    });
  } catch (error) {
    console.error("Assign role error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

const removeRoomParticipant = async (req, res) => {
  try {
    const { roomId, userId } = req.params;

    const room = await removeParticipant(
      roomId,
      req.userId,
      userId
    );

    res.status(200).json({
      message: "Participant removed successfully",
      participants: room.participants,
    });
  } catch (error) {
    console.error("Remove participant error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};


export {
  createRoom,
  joinRoom,
  getRoom,
  assignParticipantRole,
  removeRoomParticipant,
};