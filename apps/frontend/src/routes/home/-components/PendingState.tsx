export function PendingState() {
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        justifyItems: "center",
        padding: "3rem",
        backgroundColor: "rgba(15, 23, 42, 0.05)",
        borderRadius: "1rem"
      }}
    >
      <span style={{ fontWeight: 600, color: "#0f172a" }}>Loading data...</span>
      <span style={{ color: "#475569" }}>
        The TanStack Router loader is priming the React Query cache.
      </span>
    </div>
  );
}
