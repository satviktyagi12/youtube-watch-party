import {
    InputHTMLAttributes,
    forwardRef,
  } from "react";
  
  interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
  }
  
  const Input = forwardRef<HTMLInputElement, InputProps>(
    (
      {
        label,
        error,
        id,
        className = "",
        ...props
      },
      ref
    ) => {
      return (
        <div className="input-group">
          {label && (
            <label htmlFor={id} className="input-label">
              {label}
            </label>
          )}
  
          <input
            ref={ref}
            id={id}
            className={`input ${error ? "input-error" : ""} ${className}`.trim()}
            {...props}
          />
  
          {error && (
            <p className="input-error-message">
              {error}
            </p>
          )}
        </div>
      );
    }
  );
  
  Input.displayName = "Input";
  
  export default Input;