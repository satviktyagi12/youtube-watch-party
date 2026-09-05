import { Schema, model, Document } from "mongoose";
import { ParticipantRole } from "../types/participant";

interface ParticipantDocument {
  userId: string;
  username: string;
  role: ParticipantRole;
  socketId: string;
}

export interface RoomDocument extends Document {
  roomId: string;
  hostUserId: string;
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  participants: ParticipantDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<ParticipantDocument>(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Host", "Moderator", "Participant"],
      required: true,
    },
    socketId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const roomSchema = new Schema<RoomDocument>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    hostUserId: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      default: null,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    currentTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const RoomModel = model<RoomDocument>("Room", roomSchema);