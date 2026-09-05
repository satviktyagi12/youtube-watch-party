import { Participant } from "./participant";

export interface RoomState {
  roomId: string;
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
}

export interface SyncState extends RoomState {
  currentUserId: string;
}

export interface CreateRoomResponse {
  success: boolean;
  message: string;
  roomId: string;
  hostUserId: string;
}

export interface GetRoomResponse {
  success: boolean;
  room: RoomState;
}