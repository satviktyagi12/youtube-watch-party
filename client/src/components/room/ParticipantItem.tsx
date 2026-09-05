import { Participant } from "../../types/participant";
import RoleBadge from "./RoleBadge";
import RoleActions from "./RoleActions";

interface ParticipantItemProps {
  participant: Participant;
  isCurrentUser: boolean;
  isHost: boolean;
  onAssignRole: (
    userId: string,
    role: "Moderator" | "Participant"
  ) => void;
  onRemove: (userId: string) => void;
}

const ParticipantItem = ({
  participant,
  isCurrentUser,
  isHost,
  onAssignRole,
  onRemove,
}: ParticipantItemProps) => {
  return (
    <div className="participant-item">
      <div className="participant-details">
        <div className="participant-name">
          <span className="participant-avatar">
            {participant.username
              .charAt(0)
              .toUpperCase()}
          </span>

          <span>
            {participant.username}

            {isCurrentUser && (
              <span className="current-user-label">
                {" "}
                (You)
              </span>
            )}
          </span>
        </div>

        <RoleBadge role={participant.role} />
      </div>

      {isHost && !isCurrentUser && (
        <RoleActions
          participant={participant}
          onAssignRole={onAssignRole}
          onRemove={onRemove}
        />
      )}
    </div>
  );
};

export default ParticipantItem;