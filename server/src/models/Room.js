import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["host", "moderator", "participant"],
      default: "participant",
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    participants: {
      type: [participantSchema],
      default: [],
    },

    videoId: {
      type: String,
      default: null,
    },

    playState: {
      type: String,
      enum: ["playing", "paused"],
      default: "paused",
    },

    currentTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;