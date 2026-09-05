import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Header from "../components/room/Header";
import ParticipantList from "../components/room/ParticipantList";
import RoomInfo from "../components/room/RoomInfo";
import VideoControls from "../components/room/VideoControls";
import VideoInput from "../components/room/VideoInput";
import YouTubePlayer from "../components/room/YouTubePlayer";

import {
  RoomProvider,
  useRoomContext,
} from "../context/RoomContext";

import {
  getHostUserId,
  getSavedUsername,
  removeHostUserId,
} from "../utils/storage";

const RoomContent = ({
  roomId,
}: {
  roomId: string;
}) => {
  const navigate = useNavigate();

  const {
    roomState,
    participants,
    currentParticipant,
    isHost,
    canControlPlayback,
    isRemoved,
    isConnected,
    error,
    play,
    pause,
    seek,
    changeVideo,
    assignRole,
    removeParticipant,
    leaveRoom,
  } = useRoomContext();

  const [duration, setDuration] =
    useState(0);

  useEffect(() => {
    setDuration(0);
  }, [roomState?.videoId]);

  useEffect(() => {
    if (isRemoved) {
      removeHostUserId(roomId);
      navigate("/");
    }
  }, [
    isRemoved,
    navigate,
    roomId,
  ]);

  const handleLeave = (): void => {
    leaveRoom();
    removeHostUserId(roomId);
    navigate("/");
  };

  if (!isConnected) {
    return (
      <main className="room-page">
        <LoadingSpinner message="Connecting to room..." />
      </main>
    );
  }

  if (!roomState && error) {
    return (
      <main className="room-page">
        <div className="loading-container">
          <ErrorMessage
            message={error}
          />
        </div>
      </main>
    );
  }

  if (!roomState) {
    return (
      <main className="room-page">
        <LoadingSpinner message="Joining room..." />
      </main>
    );
  }

  return (
    <main className="room-page">
      <Header
        roomId={roomId}
        isConnected={isConnected}
        onLeave={handleLeave}
      />

      <div className="room-layout">
        <section className="room-main">
          <RoomInfo
            roomId={roomId}
          />

          <div className="video-section">
            {roomState.videoId ? (
              <>
                <YouTubePlayer
                  videoId={
                    roomState.videoId
                  }
                  isPlaying={
                    roomState.isPlaying
                  }
                  currentTime={
                    roomState.currentTime
                  }
                  canControlPlayback={
                    canControlPlayback
                  }
                  onPlay={play}
                  onPause={pause}
                  onDurationChange={
                    setDuration
                  }
                />

                <VideoControls
                  isPlaying={
                    roomState.isPlaying
                  }
                  currentTime={
                    roomState.currentTime
                  }
                  duration={duration}
                  disabled={
                    !canControlPlayback
                  }
                  onPlay={play}
                  onPause={pause}
                  onSeek={seek}
                />
              </>
            ) : (
              <div className="empty-video-state">
                <h2>
                  No video selected
                </h2>

                <p>
                  {canControlPlayback
                    ? "Paste a YouTube URL below to start the watch party."
                    : "Waiting for the host or moderator to select a video."}
                </p>
              </div>
            )}
          </div>

          {canControlPlayback && (
            <VideoInput
              onChangeVideo={
                changeVideo
              }
            />
          )}

          {error && (
            <ErrorMessage
              message={error}
            />
          )}
        </section>

        <ParticipantList
          participants={
            participants
          }
          currentUserId={
            currentParticipant?.userId
          }
          isHost={isHost}
          onAssignRole={
            assignRole
          }
          onRemove={
            removeParticipant
          }
        />
      </div>
    </main>
  );
};

const RoomPage = () => {
  const { roomId } =
    useParams<{
      roomId: string;
    }>();

  const navigate = useNavigate();

  const username =
    getSavedUsername();

  const hostUserId = roomId
    ? getHostUserId(roomId)
    : null;

  useEffect(() => {
    if (
      !roomId ||
      !username
    ) {
      navigate("/");
    }
  }, [
    roomId,
    username,
    navigate,
  ]);

  if (
    !roomId ||
    !username
  ) {
    return null;
  }

  return (
    <RoomProvider
      roomId={roomId}
      username={username}
      hostUserId={
        hostUserId ?? undefined
      }
    >
      <RoomContent
        roomId={roomId}
      />
    </RoomProvider>
  );
};

export default RoomPage;