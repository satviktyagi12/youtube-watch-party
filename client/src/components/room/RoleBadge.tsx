import { ParticipantRole } from "../../types/participant";

interface RoleBadgeProps {
  role: ParticipantRole;
}

const RoleBadge = ({
  role,
}: RoleBadgeProps) => {
  const roleClass = role.toLowerCase();

  return (
    <span
      className={`role-badge role-${roleClass}`}
    >
      {role}
    </span>
  );
};

export default RoleBadge;