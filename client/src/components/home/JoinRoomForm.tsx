import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../common/Button";
import Input from "../common/Input";
import ErrorMessage from "../common/ErrorMessage";
import { getRoom } from "../../services/api";
import { saveUsername } from "../../utils/storage";

const JoinRoomForm = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedRoomId = roomId.trim().toUpperCase();

    if (!trimmedUsername) {
      setError("Username is required");
      return;
    }

    if (trimmedUsername.length > 30) {
      setError(
        "Username must be 30 characters or fewer"
      );
      return;
    }

    if (!trimmedRoomId) {
      setError("Room code is required");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      await getRoom(trimmedRoomId);

      saveUsername(trimmedUsername);

      navigate(`/room/${trimmedRoomId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to join room"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="room-form"
      onSubmit={handleSubmit}
    >
      <h2>Join a Watch Party</h2>

      <Input
        id="join-room-id"
        label="Room Code"
        type="text"
        placeholder="Enter room code"
        value={roomId}
        onChange={(event) =>
          setRoomId(
            event.target.value.toUpperCase()
          )
        }
        maxLength={6}
        disabled={isLoading}
        autoComplete="off"
      />

      <Input
        id="join-username"
        label="Username"
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(event) =>
          setUsername(event.target.value)
        }
        maxLength={30}
        disabled={isLoading}
        autoComplete="name"
      />

      <ErrorMessage message={error} />

      <Button
        type="submit"
        variant="secondary"
        disabled={isLoading}
      >
        {isLoading ? "Joining..." : "Join Room"}
      </Button>
    </form>
  );
};

export default JoinRoomForm;