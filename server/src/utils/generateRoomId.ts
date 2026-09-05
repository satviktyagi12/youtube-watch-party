import { randomBytes } from "crypto";

export const generateRoomId = (): string => {
  return randomBytes(4)
    .toString("hex")
    .substring(0, 6)
    .toUpperCase();
};