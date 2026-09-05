import "dotenv/config";

import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app";
import { connectDatabase } from "./config/database";
import { registerSocketHandlers } from "./socket/socketHandlers";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./types/socket";

const PORT = Number(process.env.PORT) || 5000;

const httpServer = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(httpServer, {
  cors: {
    origin:
      process.env.CLIENT_URL || "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  registerSocketHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(
      `Socket disconnected: ${socket.id} (${reason})`
    );
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    httpServer.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();