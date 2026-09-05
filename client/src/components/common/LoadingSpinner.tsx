interface LoadingSpinnerProps {
    message?: string;
  }
  
  const LoadingSpinner = ({
    message = "Loading...",
  }: LoadingSpinnerProps) => {
    return (
      <div
        className="loading-container"
        role="status"
        aria-live="polite"
      >
        <div className="loading-spinner" />
        <span>{message}</span>
      </div>
    );
  };
  
  export default LoadingSpinner;