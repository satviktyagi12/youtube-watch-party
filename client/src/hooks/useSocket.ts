import { useEffect, useRef, useState } from "react";
import {
  AppSocket,
  createSocket,
} from "../services/socket";

interface UseSocketReturn {
  socket: AppSocket;
  isConnected: boolean;
}

export const useSocket = (): UseSocketReturn => {
  const socketRef =
    useRef<AppSocket | null>(null);

  const [isConnected, setIsConnected] =
    useState(false);

  if (!socketRef.current) {
    socketRef.current = createSocket();
  }

  const socket = socketRef.current;

  useEffect(() => {
    const handleConnect = (): void => {
      setIsConnected(true);
    };

    const handleDisconnect = (): void => {
      setIsConnected(false);
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.connect();

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.disconnect();
    };
  }, [socket]);

  return {
    socket,
    isConnected,
  };
};