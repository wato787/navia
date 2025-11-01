import type { HomeHero } from "../-types";

type Props = {
  hero: HomeHero;
};

export function HomeHeroSection({ hero }: Props) {
  return (
    <article
      style={{
        backgroundColor: "white",
        borderRadius: "1rem",
        padding: "2rem",
        boxShadow: "0 20px 45px -25px rgba(15,23,42,0.35)",
        display: "grid",
        gap: "1.5rem"
      }}
    >
      <header>
        <h1
          style={{
            fontSize: "2rem",
            margin: 0,
            color: "#0f172a"
          }}
        >
          {hero.headline}
        </h1>
        <p style={{ margin: "0.5rem 0 0", color: "#475569" }}>{hero.description}</p>
      </header>
      <ul style={{ margin: 0, paddingLeft: "1rem", color: "#0f172a", display: "grid", gap: "0.5rem" }}>
        {hero.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
