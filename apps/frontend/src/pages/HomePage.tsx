import { useState } from "react";

export function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      <h1>Bun + React + Vite</h1>
      <p>This React app now uses TanStack Router for navigation.</p>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        style={{
          fontSize: "1rem",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          border: "1px solid #333",
          cursor: "pointer"
        }}
      >
        count is {count}
      </button>
    </main>
  );
}

export default HomePage;
