import { useEffect } from "react";
import socket, { authenticateSocket } from "../socket/socket";

const useSocket = () => {
  useEffect(() => {
    authenticateSocket();

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  return socket;
};

export default useSocket;