export function ErrorNotice({ message }: { message: string }) {
  return (
    <div class="notice error" role="alert">
      {message}
    </div>
  );
}
