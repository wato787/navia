import type { KnowledgeBase } from "../-types";

type Props = {
  items: KnowledgeBase[];
};

export function AboutKnowledgeSection({ items }: Props) {
  return (
    <section style={{ display: "grid", gap: "1.5rem" }}>
      {items.map((item) => (
        <article
          key={item.title}
          style={{
            backgroundColor: "white",
            borderRadius: "1rem",
            padding: "1.75rem",
            boxShadow: "0 16px 40px -28px rgba(15,23,42,0.25)",
            display: "grid",
            gap: "0.75rem"
          }}
        >
          <h2 style={{ margin: 0, color: "#0f172a" }}>{item.title}</h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#334155" }}>
            {item.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
