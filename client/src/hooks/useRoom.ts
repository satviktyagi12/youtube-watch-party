import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppSocket } from "../services/socket";
import {
  Participant,
  ParticipantRole,
} from "../types/participant";
import {
  RoomState,
  SyncState,
} from "../types/room";

interface UseRoomReturn {
  roomState: RoomState | null;
  participants: Participant[];
  currentParticipant: Participant | null;
  currentUserId: string | undefined;

  isHost: boolean;
  isModerator: boolean;
  canControlPlayback: boolean;

  isRemoved: boolean;
  roomClosed: boolean;
  error: string | null;

  play: (currentTime?: number) => void;
  pause: (currentTime?: number) => void;
  seek: (time: number) => void;
  changeVideo: (videoId: string) => void;

  assignRole: (
    userId: string,
    role: ParticipantRole
  ) => void;

  removeParticipant: (
    userId: string
  ) => void;

  leaveRoom: () => void;
}

export const useRoom = (
  socket: AppSocket,
  roomId: string,
  username: string,
  hostUserId?: string
): UseRoomReturn => {
  const [roomState, setRoomState] =
    useState<RoomState | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState<string | undefined>(
      hostUserId
    );

  const [isRemoved, setIsRemoved] =
    useState(false);

  const [roomClosed, setRoomClosed] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const currentParticipant = useMemo(() => {
    if (
      !roomState ||
      !currentUserId
    ) {
      return null;
    }

    return (
      roomState.participants.find(
        (participant) =>
          participant.userId ===
          currentUserId
      ) ?? null
    );
  }, [
    roomState,
    currentUserId,
  ]);

  const isHost =
    currentParticipant?.role ===
    "Host";

  const isModerator =
    currentParticipant?.role ===
    "Moderator";

  const canControlPlayback =
    isHost || isModerator;

  useEffect(() => {
    const handleSyncState = (
      state: SyncState
    ): void => {
      setRoomState({
        roomId: state.roomId,
        videoId: state.videoId,
        isPlaying: state.isPlaying,
        currentTime: state.currentTime,
        participants: state.participants,
      });

      setCurrentUserId(
        state.currentUserId
      );

      setIsRemoved(false);
      setRoomClosed(false);
      setError(null);
    };

    const handleUserJoined = (data: {
      participants: Participant[];
    }): void => {
      setRoomState(
        (previousState) => {
          if (!previousState) {
            return previousState;
          }

          return {
            ...previousState,
            participants:
              data.participants,
          };
        }
      );
    };

    const handleUserLeft = (data: {
      participants: Participant[];
    }): void => {
      setRoomState(
        (previousState) => {
          if (!previousState) {
            return previousState;
          }

          return {
            ...previousState,
            participants:
              data.participants,
          };
        }
      );
    };

    const handleRoleAssigned = (
      data: {
        participants: Participant[];
      }
    ): void => {
      setRoomState(
        (previousState) => {
          if (!previousState) {
            return previousState;
          }

          return {
            ...previousState,
            participants:
              data.participants,
          };
        }
      );
    };

    const handleParticipantRemoved = (
      data: {
        userId: string;
        participants: Participant[];
      }
    ): void => {
      setRoomState(
        (previousState) => {
          if (!previousState) {
            return previousState;
          }

          return {
            ...previousState,
            participants:
              data.participants,
          };
        }
      );

      if (
        data.userId === currentUserId
      ) {
        setIsRemoved(true);
      }
    };

    const handleRoomClosed = (
      data: {
        message: string;
      }
    ): void => {
      setRoomClosed(true);
      setError(data.message);
    };

    const handlePlay = (data: {
      currentTime: number;
    }): void => {
      setRoomState(
        (previousState) => {
          if (!previousState) {
            return previousState;
          }

          return {
            ...previousState,
            isPlaying: true,
            currentTime:
              data.currentTime,
          };
        }
      );
    };

    const handlePause = (data: {
      currentTime: number;
    }): void => {
      setRoomState(
        (previousState) => {
          if (!previousState) {
            return previousState;
          }

          return {
            ...previousState,
            isPlaying: false,
            currentTime:
              data.currentTime,
          };
        }
      );
    };

    const handleSeek = (data: {
      time: number;
    }): void => {
      setRoomState(
        (previousState) => {
          if (!previousState) {
            return previousState;
          }

          return {
            ...previousState,
            currentTime: data.time,
          };
        }
      );
    };

    const handleChangeVideo = (
      data: {
        videoId: string;
        currentTime: number;
      }
    ): void => {
      setRoomState(
        (previousState) => {
          if (!previousState) {
            return previousState;
          }

          return {
            ...previousState,
            videoId:
              data.videoId,
            isPlaying: false,
            currentTime:
              data.currentTime,
          };
        }
      );
    };

    const handleError = (data: {
      message: string;
    }): void => {
      setError(data.message);
    };

    socket.on(
      "sync_state",
      handleSyncState
    );

    socket.on(
      "user_joined",
      handleUserJoined
    );

    socket.on(
      "user_left",
      handleUserLeft
    );

    socket.on(
      "role_assigned",
      handleRoleAssigned
    );

    socket.on(
      "participant_removed",
      handleParticipantRemoved
    );

    socket.on(
      "room_closed",
      handleRoomClosed
    );

    socket.on(
      "play",
      handlePlay
    );

    socket.on(
      "pause",
      handlePause
    );

    socket.on(
      "seek",
      handleSeek
    );

    socket.on(
      "change_video",
      handleChangeVideo
    );

    socket.on(
      "error",
      handleError
    );

    return () => {
      socket.off(
        "sync_state",
        handleSyncState
      );

      socket.off(
        "user_joined",
        handleUserJoined
      );

      socket.off(
        "user_left",
        handleUserLeft
      );

      socket.off(
        "role_assigned",
        handleRoleAssigned
      );

      socket.off(
        "participant_removed",
        handleParticipantRemoved
      );

      socket.off(
        "room_closed",
        handleRoomClosed
      );

      socket.off(
        "play",
        handlePlay
      );

      socket.off(
        "pause",
        handlePause
      );

      socket.off(
        "seek",
        handleSeek
      );

      socket.off(
        "change_video",
        handleChangeVideo
      );

      socket.off(
        "error",
        handleError
      );
    };
  }, [
    socket,
    currentUserId,
  ]);

  useEffect(() => {
    const joinRoom = (): void => {
      if (
        !roomId ||
        !username
      ) {
        return;
      }

      socket.emit(
        "join_room",
        {
          roomId,
          username,
          userId: hostUserId,
        }
      );
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on(
      "connect",
      joinRoom
    );

    return () => {
      socket.off(
        "connect",
        joinRoom
      );
    };
  }, [
    socket,
    roomId,
    username,
    hostUserId,
  ]);

  const play = useCallback(
    (currentTime?: number): void => {
      socket.emit(
        "play",
        {
          roomId,
          currentTime,
        }
      );
    },
    [socket, roomId]
  );

  const pause = useCallback(
    (currentTime?: number): void => {
      socket.emit(
        "pause",
        {
          roomId,
          currentTime,
        }
      );
    },
    [socket, roomId]
  );

  const seek = useCallback(
    (time: number): void => {
      socket.emit(
        "seek",
        {
          roomId,
          time,
        }
      );
    },
    [socket, roomId]
  );

  const changeVideo = useCallback(
    (videoId: string): void => {
      socket.emit(
        "change_video",
        {
          roomId,
          videoId,
        }
      );
    },
    [socket, roomId]
  );

  const assignRole = useCallback(
    (
      userId: string,
      role: ParticipantRole
    ): void => {
      socket.emit(
        "assign_role",
        {
          roomId,
          userId,
          role,
        }
      );
    },
    [socket, roomId]
  );

  const removeParticipant =
    useCallback(
      (userId: string): void => {
        socket.emit(
          "remove_participant",
          {
            roomId,
            userId,
          }
        );
      },
      [socket, roomId]
    );

  const leaveRoom =
    useCallback((): void => {
      socket.emit(
        "leave_room",
        {
          roomId,
        }
      );
    }, [socket, roomId]);

  return {
    roomState,
    participants:
      roomState?.participants ?? [],
    currentParticipant,
    currentUserId,

    isHost,
    isModerator,
    canControlPlayback,

    isRemoved,
    roomClosed,
    error,

    play,
    pause,
    seek,
    changeVideo,
    assignRole,
    removeParticipant,
    leaveRoom,
  };
};