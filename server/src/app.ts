import express from "express";
import cors from "cors";

import roomRoutes from "./routes/roomRoutes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/rooms", roomRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;