import Button from "../common/Button";

interface HeaderProps {
  roomId: string;
  isConnected: boolean;
  onLeave: () => void;
}

const Header = ({
  roomId,
  isConnected,
  onLeave,
}: HeaderProps) => {
  return (
    <header className="room-header">
      <div className="room-header-brand">
        <h1>YouTube Watch Party</h1>

        <div className="connection-status">
          <span
            className={`connection-dot ${
              isConnected ? "connected" : "disconnected"
            }`}
          />
          <span>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="room-header-actions">
        <span className="room-header-room-id">
          Room: <strong>{roomId}</strong>
        </span>

        <Button
          variant="danger"
          onClick={onLeave}
        >
          Leave Room
        </Button>
      </div>
    </header>
  );
};

export default Header;