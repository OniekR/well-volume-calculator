interface ToastProps {
  message: string;
}

const Toast = ({ message }: ToastProps) => {
  return (
    <div className="fixed bottom-24 right-6 rounded-2xl bg-[var(--eq-text)] px-4 py-3 text-sm text-white">
      {message}
    </div>
  );
};

export default Toast;
