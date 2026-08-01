export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-danger" role="alert">
      {message}
    </p>
  );
}
