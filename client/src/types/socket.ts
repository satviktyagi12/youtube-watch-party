import {
  Participant,
  ParticipantRole,
} from "./participant";
import { SyncState } from "./room";

export interface JoinRoomPayload {
  roomId: string;
  username: string;
  userId?: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface PlayPayload {
  roomId: string;
  currentTime?: number;
}

export interface PausePayload {
  roomId: string;
  currentTime?: number;
}

export interface SeekPayload {
  roomId: string;
  time: number;
}

export interface ChangeVideoPayload {
  roomId: string;
  videoId: string;
}

export interface AssignRolePayload {
  roomId: string;
  userId: string;
  role: ParticipantRole;
}

export interface RemoveParticipantPayload {
  roomId: string;
  userId: string;
}

export interface ServerToClientEvents {
  sync_state: (state: SyncState) => void;

  play: (data: {
    currentTime: number;
  }) => void;

  pause: (data: {
    currentTime: number;
  }) => void;

  seek: (data: {
    time: number;
  }) => void;

  change_video: (data: {
    videoId: string;
    currentTime: number;
  }) => void;

  user_joined: (data: {
    username: string;
    userId: string;
    role: ParticipantRole;
    participants: Participant[];
  }) => void;

  user_left: (data: {
    username: string;
    userId: string;
    participants: Participant[];
  }) => void;

  role_assigned: (data: {
    userId: string;
    username: string;
    role: ParticipantRole;
    participants: Participant[];
  }) => void;

  participant_removed: (data: {
    userId: string;
    participants: Participant[];
  }) => void;

  error: (data: {
    message: string;
  }) => void;
}

export interface ClientToServerEvents {
  join_room: (
    payload: JoinRoomPayload
  ) => void;

  leave_room: (
    payload: LeaveRoomPayload
  ) => void;

  play: (
    payload: PlayPayload
  ) => void;

  pause: (
    payload: PausePayload
  ) => void;

  seek: (
    payload: SeekPayload
  ) => void;

  change_video: (
    payload: ChangeVideoPayload
  ) => void;

  assign_role: (
    payload: AssignRolePayload
  ) => void;

  remove_participant: (
    payload: RemoveParticipantPayload
  ) => void;
}