import { useState } from "react";
import Button from "../common/Button";

interface RoomInfoProps {
  roomId: string;
}

const RoomInfo = ({
  roomId,
}: RoomInfoProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      const roomUrl = `${window.location.origin}/room/${roomId}`;

      await navigator.clipboard.writeText(roomUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="room-info">
      <div className="room-info-code">
        <span className="room-info-label">
          Room Code
        </span>

        <strong className="room-info-value">
          {roomId}
        </strong>
      </div>

      <Button
        variant="secondary"
        onClick={handleCopy}
      >
        {copied ? "Copied!" : "Copy Invite Link"}
      </Button>
    </div>
  );
};

export default RoomInfo;