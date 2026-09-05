import {
    createContext,
    ReactNode,
    useContext,
  } from "react";
  
  import { useRoom } from "../hooks/useRoom";
  import { useSocket } from "../hooks/useSocket";
  import { ParticipantRole } from "../types/participant";
  
  interface RoomContextValue {
    roomState: ReturnType<
      typeof useRoom
    >["roomState"];
  
    participants: ReturnType<
      typeof useRoom
    >["participants"];
  
    currentParticipant: ReturnType<
      typeof useRoom
    >["currentParticipant"];
  
    isHost: boolean;
    isModerator: boolean;
    canControlPlayback: boolean;
    isRemoved: boolean;
    isConnected: boolean;
    error: string | null;
  
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    changeVideo: (videoId: string) => void;
    assignRole: (
      userId: string,
      role: ParticipantRole
    ) => void;
    removeParticipant: (userId: string) => void;
    leaveRoom: () => void;
  }
  
  interface RoomProviderProps {
    roomId: string;
    username: string;
    hostUserId?: string;
    children: ReactNode;
  }
  
  const RoomContext =
    createContext<RoomContextValue | null>(null);
  
  export const RoomProvider = ({
    roomId,
    username,
    hostUserId,
    children,
  }: RoomProviderProps) => {
    const { socket, isConnected } = useSocket();
  
    const room = useRoom(
      socket,
      roomId,
      username,
      hostUserId
    );
  
    const value: RoomContextValue = {
      roomState: room.roomState,
      participants: room.participants,
      currentParticipant:
        room.currentParticipant,
      isHost: room.isHost,
      isModerator: room.isModerator,
      canControlPlayback:
        room.canControlPlayback,
      isRemoved: room.isRemoved,
      isConnected,
      error: room.error,
  
      play: room.play,
      pause: room.pause,
      seek: room.seek,
      changeVideo: room.changeVideo,
      assignRole: room.assignRole,
      removeParticipant:
        room.removeParticipant,
      leaveRoom: room.leaveRoom,
    };
  
    return (
      <RoomContext.Provider value={value}>
        {children}
      </RoomContext.Provider>
    );
  };
  
  export const useRoomContext =
    (): RoomContextValue => {
      const context = useContext(RoomContext);
  
      if (!context) {
        throw new Error(
          "useRoomContext must be used inside a RoomProvider"
        );
      }
  
      return context;
    };