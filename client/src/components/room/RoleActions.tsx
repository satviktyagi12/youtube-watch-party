import Button from "../common/Button";
import { Participant } from "../../types/participant";

interface RoleActionsProps {
  participant: Participant;
  onAssignRole: (
    userId: string,
    role: "Moderator" | "Participant"
  ) => void;
  onRemove: (userId: string) => void;
}

const RoleActions = ({
  participant,
  onAssignRole,
  onRemove,
}: RoleActionsProps) => {
  if (participant.role === "Host") {
    return null;
  }

  const nextRole =
    participant.role === "Moderator"
      ? "Participant"
      : "Moderator";

  return (
    <div className="role-actions">
      <Button
        variant="ghost"
        onClick={() =>
          onAssignRole(
            participant.userId,
            nextRole
          )
        }
      >
        {participant.role === "Moderator"
          ? "Make Participant"
          : "Make Moderator"}
      </Button>

      <Button
        variant="danger"
        onClick={() =>
          onRemove(participant.userId)
        }
      >
        Remove
      </Button>
    </div>
  );
};

export default RoleActions;