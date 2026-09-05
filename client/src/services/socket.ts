import { io, Socket } from "socket.io-client";

import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../types/socket";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

export type AppSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export const createSocket = (): AppSocket => {
  return io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
  });
};