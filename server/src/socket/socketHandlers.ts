import { Server, Socket } from "socket.io";

import { roomManager } from "../classes/RoomManager";
import {
  canControlPlayback,
  canManageParticipants,
} from "../utils/permissions";
import { isValidYouTubeVideoId } from "../utils/youtube";
import { ParticipantRole } from "../types/participant";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../types/socket";

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents
>;

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents
>;

interface SocketData {
  roomId?: string;
  userId?: string;
}

const getSocketData = (
  socket: AppSocket
): SocketData => {
  return socket.data as SocketData;
};

const emitError = (
  socket: AppSocket,
  message: string
): void => {
  socket.emit("error", { message });
};

const getRoomAndUser = (
  socket: AppSocket,
  roomId: string
) => {
  const room = roomManager.getRoom(roomId);

  if (!room) {
    emitError(socket, "Room not found");
    return null;
  }

  const data = getSocketData(socket);

  if (
    data.roomId !== roomId ||
    !data.userId
  ) {
    emitError(
      socket,
      "You are not a member of this room"
    );
    return null;
  }

  const participant =
    room.getParticipant(data.userId);

  if (!participant) {
    emitError(
      socket,
      "Participant not found"
    );
    return null;
  }

  return {
    room,
    participant,
  };
};

const getRoomAndUserForManagement = (
  socket: AppSocket,
  roomId: string
) => {
  const room = roomManager.getRoom(roomId);

  if (!room) {
    emitError(socket, "Room not found");
    return null;
  }

  const data = getSocketData(socket);

  if (
    data.roomId !== roomId ||
    !data.userId
  ) {
    emitError(
      socket,
      "You are not a member of this room"
    );
    return null;
  }

  const participant =
    room.getParticipant(data.userId);

  if (!participant) {
    emitError(
      socket,
      "Participant not found"
    );
    return null;
  }

  return {
    room,
    participant,
  };
};

const removeParticipantFromRoom = (
  io: AppServer,
  socket: AppSocket,
  roomId: string
): void => {
  const room = roomManager.getRoom(roomId);

  if (!room) {
    return;
  }

  const data = getSocketData(socket);

  if (!data.userId) {
    return;
  }

  const participant =
    room.removeParticipant(data.userId);

  if (!participant) {
    return;
  }

  socket.leave(roomId);

  data.roomId = undefined;
  data.userId = undefined;

  /*
   * Notify remaining participants that this user left.
   */
  io.to(roomId).emit("user_left", {
    username: participant.username,
    userId: participant.userId,
    participants: room.getParticipants(),
  });

  /*
   * Host leaving closes the MVP room because
   * host transfer is not implemented.
   */
  if (participant.role === "Host") {
    io.to(roomId).emit("room_closed", {
      message:
        "The host has left. This watch party has ended.",
    });

    roomManager.deleteRoom(roomId);
    return;
  }

  roomManager.removeEmptyRoom(roomId);
};

const handleJoinRoom = (
  socket: AppSocket,
  payload: {
    roomId: string;
    username: string;
    userId?: string;
  }
): void => {
  const roomId =
    payload.roomId?.trim().toUpperCase();

  const username =
    payload.username?.trim();

  const requestedUserId =
    payload.userId?.trim();

  if (!roomId || !username) {
    emitError(
      socket,
      "Room ID and username are required"
    );
    return;
  }

  if (username.length > 30) {
    emitError(
      socket,
      "Username must be 30 characters or fewer"
    );
    return;
  }

  const socketData = getSocketData(socket);

  if (socketData.roomId) {
    emitError(
      socket,
      "You are already in a room"
    );
    return;
  }

  const room =
    roomManager.getRoom(roomId);

  if (!room) {
    emitError(
      socket,
      "Room not found"
    );
    return;
  }

  const host = room.getHost();

  let participant;

  /*
   * Reconnect the existing host when the stored
   * host user ID is supplied by the same session.
   */
  if (
    requestedUserId &&
    host &&
    requestedUserId === host.userId
  ) {
    if (
      host.socketId &&
      host.socketId !== "pending" &&
      host.socketId !== "" &&
      host.socketId !== socket.id
    ) {
      emitError(
        socket,
        "Host session is already connected"
      );
      return;
    }

    host.updateSocketId(socket.id);
    participant = host;
  } else {
    participant = room.addParticipant(
      username,
      socket.id
    );
  }

  socket.join(roomId);

  socketData.roomId = roomId;
  socketData.userId =
    participant.userId;

  socket.emit("sync_state", {
    ...room.getState(),
    currentUserId:
      participant.userId,
  });

  socket.to(roomId).emit(
    "user_joined",
    {
      username:
        participant.username,
      userId:
        participant.userId,
      role:
        participant.role,
      participants:
        room.getParticipants(),
    }
  );
};

const handleLeaveRoom = (
  io: AppServer,
  socket: AppSocket,
  roomId: string
): void => {
  const normalizedRoomId =
    roomId?.trim().toUpperCase();

  if (!normalizedRoomId) {
    emitError(
      socket,
      "Room ID is required"
    );
    return;
  }

  removeParticipantFromRoom(
    io,
    socket,
    normalizedRoomId
  );
};

const handlePlay = (
  io: AppServer,
  socket: AppSocket,
  payload: {
    roomId: string;
    currentTime?: number;
  }
): void => {
  const result = getRoomAndUser(
    socket,
    payload.roomId
  );

  if (!result) {
    return;
  }

  const { room, participant } =
    result;

  if (
    !canControlPlayback(
      participant.role
    )
  ) {
    emitError(
      socket,
      "You do not have permission to control playback"
    );
    return;
  }

  const roomState =
    room.getState();

  const currentTime =
    typeof payload.currentTime ===
      "number" &&
    Number.isFinite(
      payload.currentTime
    ) &&
    payload.currentTime >= 0
      ? payload.currentTime
      : roomState.currentTime;

  room.setPlaybackState(
    true,
    currentTime
  );

  io.to(room.roomId).emit(
    "play",
    {
      currentTime,
    }
  );
};

const handlePause = (
  io: AppServer,
  socket: AppSocket,
  payload: {
    roomId: string;
    currentTime?: number;
  }
): void => {
  const result = getRoomAndUser(
    socket,
    payload.roomId
  );

  if (!result) {
    return;
  }

  const { room, participant } =
    result;

  if (
    !canControlPlayback(
      participant.role
    )
  ) {
    emitError(
      socket,
      "You do not have permission to control playback"
    );
    return;
  }

  const roomState =
    room.getState();

  const currentTime =
    typeof payload.currentTime ===
      "number" &&
    Number.isFinite(
      payload.currentTime
    ) &&
    payload.currentTime >= 0
      ? payload.currentTime
      : roomState.currentTime;

  room.setPlaybackState(
    false,
    currentTime
  );

  io.to(room.roomId).emit(
    "pause",
    {
      currentTime,
    }
  );
};

const handleSeek = (
  io: AppServer,
  socket: AppSocket,
  payload: {
    roomId: string;
    time: number;
  }
): void => {
  const result = getRoomAndUser(
    socket,
    payload.roomId
  );

  if (!result) {
    return;
  }

  const { room, participant } =
    result;

  if (
    !canControlPlayback(
      participant.role
    )
  ) {
    emitError(
      socket,
      "You do not have permission to control playback"
    );
    return;
  }

  if (
    typeof payload.time !==
      "number" ||
    !Number.isFinite(
      payload.time
    ) ||
    payload.time < 0
  ) {
    emitError(
      socket,
      "Invalid seek time"
    );
    return;
  }

  room.setCurrentTime(
    payload.time
  );

  io.to(room.roomId).emit(
    "seek",
    {
      time: payload.time,
    }
  );
};

const handleChangeVideo = (
  io: AppServer,
  socket: AppSocket,
  payload: {
    roomId: string;
    videoId: string;
  }
): void => {
  const result = getRoomAndUser(
    socket,
    payload.roomId
  );

  if (!result) {
    return;
  }

  const { room, participant } =
    result;

  if (
    !canControlPlayback(
      participant.role
    )
  ) {
    emitError(
      socket,
      "You do not have permission to change the video"
    );
    return;
  }

  if (
    !isValidYouTubeVideoId(
      payload.videoId
    )
  ) {
    emitError(
      socket,
      "Invalid YouTube video ID"
    );
    return;
  }

  room.setVideo(
    payload.videoId
  );

  io.to(room.roomId).emit(
    "change_video",
    {
      videoId:
        payload.videoId,
      currentTime: 0,
    }
  );
};

const handleAssignRole = (
  io: AppServer,
  socket: AppSocket,
  payload: {
    roomId: string;
    userId: string;
    role: ParticipantRole;
  }
): void => {
  const result =
    getRoomAndUserForManagement(
      socket,
      payload.roomId
    );

  if (!result) {
    return;
  }

  const {
    room,
    participant: requester,
  } = result;

  if (requester.role !== "Host") {
    emitError(
      socket,
      "Only the host can assign roles"
    );
    return;
  }

  if (
    payload.role !== "Moderator" &&
    payload.role !== "Participant"
  ) {
    emitError(
      socket,
      "Invalid role"
    );
    return;
  }

  const target =
    room.getParticipant(
      payload.userId
    );

  if (!target) {
    emitError(
      socket,
      "Participant not found"
    );
    return;
  }

  if (target.role === "Host") {
    emitError(
      socket,
      "The host role cannot be changed"
    );
    return;
  }

  const updatedParticipant =
    room.assignRole(
      target.userId,
      payload.role
    );

  if (!updatedParticipant) {
    emitError(
      socket,
      "Unable to assign role"
    );
    return;
  }

  io.to(room.roomId).emit(
    "role_assigned",
    {
      userId:
        updatedParticipant.userId,
      username:
        updatedParticipant.username,
      role:
        updatedParticipant.role,
      participants:
        room.getParticipants(),
    }
  );
};

const handleRemoveParticipant = (
  io: AppServer,
  socket: AppSocket,
  payload: {
    roomId: string;
    userId: string;
  }
): void => {
  const result =
    getRoomAndUserForManagement(
      socket,
      payload.roomId
    );

  if (!result) {
    return;
  }

  const {
    room,
    participant: requester,
  } = result;

  if (
    !canManageParticipants(
      requester.role
    )
  ) {
    emitError(
      socket,
      "Only the host can manage participants"
    );
    return;
  }

  const target =
    room.getParticipant(
      payload.userId
    );

  if (!target) {
    emitError(
      socket,
      "Participant not found"
    );
    return;
  }

  if (target.role === "Host") {
    emitError(
      socket,
      "The host cannot be removed"
    );
    return;
  }

  const removedParticipant =
    room.removeParticipant(
      target.userId
    );

  if (!removedParticipant) {
    emitError(
      socket,
      "Unable to remove participant"
    );
    return;
  }

  const targetSocket =
    io.sockets.sockets.get(
      removedParticipant.socketId
    );

  io.to(room.roomId).emit(
    "participant_removed",
    {
      userId:
        removedParticipant.userId,
      participants:
        room.getParticipants(),
    }
  );

  if (targetSocket) {
    targetSocket.leave(
      room.roomId
    );

    const targetData =
      getSocketData(
        targetSocket as AppSocket
      );

    targetData.roomId = undefined;
    targetData.userId = undefined;
  }

  roomManager.removeEmptyRoom(
    room.roomId
  );
};

const handleDisconnect = (
  io: AppServer,
  socket: AppSocket
): void => {
  const data =
    getSocketData(socket);

  if (
    !data.roomId ||
    !data.userId
  ) {
    return;
  }

  const room =
    roomManager.getRoom(
      data.roomId
    );

  if (!room) {
    return;
  }

  const participant =
    room.getParticipant(
      data.userId
    );

  if (!participant) {
    return;
  }

  /*
   * Keep the host in the room after a temporary
   * disconnect so a refresh/reconnect can work.
   */
  if (participant.role === "Host") {
    participant.updateSocketId("");

    data.roomId = undefined;
    data.userId = undefined;

    return;
  }

  const removedParticipant =
    room.removeParticipant(
      participant.userId
    );

  if (!removedParticipant) {
    return;
  }

  io.to(room.roomId).emit(
    "user_left",
    {
      username:
        removedParticipant.username,
      userId:
        removedParticipant.userId,
      participants:
        room.getParticipants(),
    }
  );

  data.roomId = undefined;
  data.userId = undefined;

  roomManager.removeEmptyRoom(
    room.roomId
  );
};

export const registerSocketHandlers = (
  io: AppServer,
  socket: AppSocket
): void => {
  socket.on(
    "join_room",
    (payload) => {
      handleJoinRoom(
        socket,
        payload
      );
    }
  );

  socket.on(
    "leave_room",
    (payload) => {
      handleLeaveRoom(
        io,
        socket,
        payload.roomId
      );
    }
  );

  socket.on(
    "play",
    (payload) => {
      handlePlay(
        io,
        socket,
        payload
      );
    }
  );

  socket.on(
    "pause",
    (payload) => {
      handlePause(
        io,
        socket,
        payload
      );
    }
  );

  socket.on(
    "seek",
    (payload) => {
      handleSeek(
        io,
        socket,
        payload
      );
    }
  );

  socket.on(
    "change_video",
    (payload) => {
      handleChangeVideo(
        io,
        socket,
        payload
      );
    }
  );

  socket.on(
    "assign_role",
    (payload) => {
      handleAssignRole(
        io,
        socket,
        payload
      );
    }
  );

  socket.on(
    "remove_participant",
    (payload) => {
      handleRemoveParticipant(
        io,
        socket,
        payload
      );
    }
  );

  socket.on(
    "disconnect",
    () => {
      handleDisconnect(
        io,
        socket
      );
    }
  );
};