import { useEffect } from "react";
import socket from "../socket/socket";

const useSocket = () => {
  useEffect(() => {
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  return socket;
};

export default useSocket;