import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(apiUrl, {
  autoConnect: false,
});

export default socket;