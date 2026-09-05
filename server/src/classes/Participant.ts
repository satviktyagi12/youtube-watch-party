import { Participant as ParticipantData, ParticipantRole } from "../types/participant";

export class Participant {
  public readonly userId: string;
  public username: string;
  public role: ParticipantRole;
  public socketId: string;

  constructor(data: ParticipantData) {
    this.userId = data.userId;
    this.username = data.username;
    this.role = data.role;
    this.socketId = data.socketId;
  }

  public setRole(role: ParticipantRole): void {
    this.role = role;
  }

  public updateSocketId(socketId: string): void {
    this.socketId = socketId;
  }

  public toJSON(): ParticipantData {
    return {
      userId: this.userId,
      username: this.username,
      role: this.role,
      socketId: this.socketId,
    };
  }
}