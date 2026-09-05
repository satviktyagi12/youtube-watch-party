export type ParticipantRole =
  | "Host"
  | "Moderator"
  | "Participant";

export interface Participant {
  userId: string;
  username: string;
  role: ParticipantRole;
  socketId: string;
}