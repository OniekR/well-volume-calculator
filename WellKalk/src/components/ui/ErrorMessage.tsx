interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return <p className="text-xs text-[var(--eq-danger)]">{message}</p>;
};

export default ErrorMessage;
