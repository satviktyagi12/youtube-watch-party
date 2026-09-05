import { Request, Response, NextFunction } from "express";
import { roomManager } from "../classes/RoomManager";

export const createRoom = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { username } = req.body;

    if (
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Username is required",
      });
      return;
    }

    if (username.trim().length > 30) {
      res.status(400).json({
        success: false,
        message: "Username must be 30 characters or fewer",
      });
      return;
    }

    const { room, hostUserId } = roomManager.createRoom(
      username.trim(),
      "pending"
    );

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      roomId: room.roomId,
      hostUserId,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const paramRoomId = req.params.roomId;

    const roomId = Array.isArray(paramRoomId)
      ? paramRoomId[0]
      : paramRoomId;

    const room = roomManager.getRoom(
      roomId.toUpperCase()
    );

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      room: room.getState(),
    });
  } catch (error) {
    next(error);
  }
};