interface ErrorMessageProps {
    message: string | null | undefined;
    className?: string;
  }
  
  const ErrorMessage = ({
    message,
    className = "",
  }: ErrorMessageProps) => {
    if (!message) {
      return null;
    }
  
    return (
      <div
        className={`error-message ${className}`.trim()}
        role="alert"
      >
        {message}
      </div>
    );
  };
  
  export default ErrorMessage;