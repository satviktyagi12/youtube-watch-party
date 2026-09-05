import { randomUUID } from "crypto";
import { Room } from "./Room";

export class RoomManager {
  private readonly rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  public createRoom(
    username: string,
    socketId: string
  ): { room: Room; hostUserId: string } {
    let roomId = this.generateRoomId();

    while (this.rooms.has(roomId)) {
      roomId = this.generateRoomId();
    }

    const room = new Room(roomId, username, socketId);
    const host = room.getHost();

    this.rooms.set(roomId, room);

    return {
      room,
      hostUserId: host!.userId,
    };
  }

  public getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) ?? null;
  }

  public hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  public deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  public getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  public removeEmptyRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room || !room.isEmpty()) {
      return false;
    }

    return this.rooms.delete(roomId);
  }

  private generateRoomId(): string {
    return randomUUID()
      .replace(/-/g, "")
      .substring(0, 6)
      .toUpperCase();
  }
}

export const roomManager = new RoomManager();