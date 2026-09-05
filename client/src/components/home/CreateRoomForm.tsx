import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../common/Button";
import Input from "../common/Input";
import ErrorMessage from "../common/ErrorMessage";
import { createRoom } from "../../services/api";
import {
  saveHostUserId,
  saveUsername,
} from "../../utils/storage";

const CreateRoomForm = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const trimmedUsername = username.trim();

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

    try {
      setError(null);
      setIsLoading(true);

      const response = await createRoom(
        trimmedUsername
      );

      saveUsername(trimmedUsername);
      saveHostUserId(
        response.roomId,
        response.hostUserId
      );

      navigate(`/room/${response.roomId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create room"
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
      <h2>Create a Watch Party</h2>

      <Input
        id="create-username"
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
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  );
};

export default CreateRoomForm;