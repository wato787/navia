type Props = {
  message: string;
};

export function ErrorState({ message }: Props) {
  return (
    <div
      style={{
        padding: "2rem",
        borderRadius: "1rem",
        backgroundColor: "rgba(252, 165, 165, 0.15)",
        color: "#991b1b",
        display: "grid",
        gap: "0.75rem"
      }}
    >
      <strong>Unable to fetch team focus.</strong>
      <span>{message}</span>
    </div>
  );
}
