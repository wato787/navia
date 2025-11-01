type Props = {
  message: string;
};

export function ErrorState({ message }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gap: "0.75rem",
        padding: "2rem",
        borderRadius: "1rem",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        color: "#991b1b"
      }}
    >
      <strong>Failed to load data</strong>
      <span>{message}</span>
    </div>
  );
}
