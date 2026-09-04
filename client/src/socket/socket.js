import { io } from "socket.io-client";

const socket = io("https://youtube-watch-party-system-bdjb.onrender.com", {
  autoConnect: false,
});

export default socket;