import { Participant } from "../../types/participant";
import ParticipantItem from "./ParticipantItem";

interface ParticipantListProps {
  participants: Participant[];
  currentUserId: string | undefined;
  isHost: boolean;
  onAssignRole: (
    userId: string,
    role: "Moderator" | "Participant"
  ) => void;
  onRemove: (userId: string) => void;
}

const ParticipantList = ({
  participants,
  currentUserId,
  isHost,
  onAssignRole,
  onRemove,
}: ParticipantListProps) => {
  return (
    <aside className="participant-list">
      <div className="participant-list-header">
        <h2>Participants</h2>

        <span className="participant-count">
          {participants.length}
        </span>
      </div>

      <div className="participant-list-content">
        {participants.length === 0 ? (
          <p className="empty-participants">
            No participants yet.
          </p>
        ) : (
          participants.map((participant) => (
            <ParticipantItem
              key={participant.userId}
              participant={participant}
              isCurrentUser={
                participant.userId ===
                currentUserId
              }
              isHost={isHost}
              onAssignRole={onAssignRole}
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default ParticipantList;