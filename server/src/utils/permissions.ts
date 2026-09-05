import { ParticipantRole } from "../types/participant";

export const canControlPlayback = (
  role: ParticipantRole
): boolean => {
  return role === "Host" || role === "Moderator";
};

export const canAssignRoles = (
  role: ParticipantRole
): boolean => {
  return role === "Host";
};

export const canManageParticipants = (
  role: ParticipantRole
): boolean => {
  return role === "Host";
};