import {
    FormEvent,
    useEffect,
    useRef,
    useState,
  } from "react";
  
  import Button from "../common/Button";
  import Input from "../common/Input";
  import { useRoomContext } from "../../context/RoomContext";
  
  const Chat = () => {
    const {
      messages,
      currentUserId,
      sendMessage,
      error,
    } = useRoomContext();
  
    const [message, setMessage] =
      useState("");
  
    const messagesEndRef =
      useRef<HTMLDivElement | null>(
        null
      );
  
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, [messages]);
  
    const handleSubmit = (
      event: FormEvent<HTMLFormElement>
    ): void => {
      event.preventDefault();
  
      const trimmedMessage =
        message.trim();
  
      if (!trimmedMessage) {
        return;
      }
  
      sendMessage(trimmedMessage);
      setMessage("");
    };
  
    return (
      <section className="chat">
        <div className="chat-header">
          <h2>Chat</h2>
  
          <span>
            {messages.length}
          </span>
        </div>
  
        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="chat-empty">
              No messages yet. Start the
              conversation.
            </p>
          ) : (
            messages.map(
              (chatMessage, index) => (
                <div
                  key={`${chatMessage.userId}-${chatMessage.timestamp}-${index}`}
                  className={`chat-message ${
                    chatMessage.userId ===
                    currentUserId
                      ? "chat-message-own"
                      : ""
                  }`}
                >
                  <div className="chat-message-meta">
                    <strong>
                      {chatMessage.username}
                    </strong>
  
                    <span>
                      {new Date(
                        chatMessage.timestamp
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute:
                            "2-digit",
                        }
                      )}
                    </span>
                  </div>
  
                  <p>
                    {chatMessage.message}
                  </p>
                </div>
              )
            )
          )}
  
          <div
            ref={messagesEndRef}
          />
        </div>
  
        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}
  
        <form
          className="chat-form"
          onSubmit={handleSubmit}
        >
          <Input
            id="chat-message"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            maxLength={500}
          />
  
          <Button
            type="submit"
            disabled={
              !message.trim()
            }
          >
            Send
          </Button>
        </form>
      </section>
    );
  };
  
  export default Chat;