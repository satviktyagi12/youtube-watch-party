import { randomUUID } from "crypto";
import {
  ParticipantRole,
  Participant,
} from "../types/participant";
import { RoomState } from "../types/room";
import { Participant as ParticipantClass } from "./Participant";

export class Room {
  public readonly roomId: string;

  private videoId: string | null;
  private isPlaying: boolean;
  private currentTime: number;
  private playbackStartedAt: number | null;

  private readonly participants: Map<
    string,
    ParticipantClass
  >;

  constructor(
    roomId: string,
    hostUsername: string,
    hostSocketId: string
  ) {
    this.roomId = roomId;
    this.videoId = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.playbackStartedAt = null;
    this.participants = new Map();

    const host = new ParticipantClass({
      userId: randomUUID(),
      username: hostUsername,
      role: "Host",
      socketId: hostSocketId,
    });

    this.participants.set(host.userId, host);
  }

  public addParticipant(
    username: string,
    socketId: string
  ): ParticipantClass {
    const participant = new ParticipantClass({
      userId: randomUUID(),
      username,
      role: "Participant",
      socketId,
    });

    this.participants.set(
      participant.userId,
      participant
    );

    return participant;
  }

  public removeParticipant(
    userId: string
  ): ParticipantClass | null {
    const participant =
      this.participants.get(userId);

    if (!participant) {
      return null;
    }

    this.participants.delete(userId);

    return participant;
  }

  public getParticipant(
    userId: string
  ): ParticipantClass | null {
    return (
      this.participants.get(userId) ?? null
    );
  }

  public getParticipantBySocketId(
    socketId: string
  ): ParticipantClass | null {
    if (!socketId) {
      return null;
    }

    for (const participant of this.participants.values()) {
      if (participant.socketId === socketId) {
        return participant;
      }
    }

    return null;
  }

  public getParticipants(): Participant[] {
    return Array.from(
      this.participants.values()
    ).map((participant) =>
      participant.toJSON()
    );
  }

  public assignRole(
    userId: string,
    role: ParticipantRole
  ): ParticipantClass | null {
    const participant =
      this.participants.get(userId);

    if (!participant) {
      return null;
    }

    if (participant.role === "Host") {
      return participant;
    }

    participant.setRole(role);

    return participant;
  }

  public setPlaybackState(
    isPlaying: boolean,
    currentTime: number
  ): void {
    const normalizedTime = Math.max(
      0,
      currentTime
    );

    this.currentTime = normalizedTime;
    this.isPlaying = isPlaying;

    if (isPlaying) {
      this.playbackStartedAt =
        Date.now() - normalizedTime * 1000;
    } else {
      this.playbackStartedAt = null;
    }
  }

  public setCurrentTime(
    currentTime: number
  ): void {
    const normalizedTime = Math.max(
      0,
      currentTime
    );

    this.currentTime = normalizedTime;

    if (this.isPlaying) {
      this.playbackStartedAt =
        Date.now() - normalizedTime * 1000;
    }
  }

  public setPlaying(
    isPlaying: boolean
  ): void {
    if (isPlaying) {
      this.isPlaying = true;
      this.playbackStartedAt =
        Date.now() -
        this.currentTime * 1000;

      return;
    }

    this.currentTime =
      this.getCurrentPlaybackTime();

    this.isPlaying = false;
    this.playbackStartedAt = null;
  }

  public setVideo(videoId: string): void {
    this.videoId = videoId;
    this.currentTime = 0;
    this.isPlaying = false;
    this.playbackStartedAt = null;
  }

  public getState(): RoomState {
    return {
      roomId: this.roomId,
      videoId: this.videoId,
      isPlaying: this.isPlaying,
      currentTime:
        this.getCurrentPlaybackTime(),
      participants:
        this.getParticipants(),
    };
  }

  public isEmpty(): boolean {
    return this.participants.size === 0;
  }

  public getHost(): ParticipantClass | null {
    for (const participant of this.participants.values()) {
      if (participant.role === "Host") {
        return participant;
      }
    }

    return null;
  }

  private getCurrentPlaybackTime(): number {
    if (
      !this.isPlaying ||
      this.playbackStartedAt === null
    ) {
      return this.currentTime;
    }

    const elapsedSeconds =
      (Date.now() - this.playbackStartedAt) /
      1000;

    return Math.max(
      0,
      this.currentTime + elapsedSeconds
    );
  }
}