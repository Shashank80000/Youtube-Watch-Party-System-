import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createRoom,
  joinRoom,
  getRoom,
    assignParticipantRole,
  removeRoomParticipant,

} from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", authMiddleware, createRoom);

router.post("/:roomId/join", authMiddleware, joinRoom);

router.get("/:roomId", authMiddleware, getRoom);

router.patch(
  "/:roomId/participants/:userId/role",
  authMiddleware,
  assignParticipantRole
);

router.delete(
  "/:roomId/participants/:userId",
  authMiddleware,
  removeRoomParticipant
);

export default router;