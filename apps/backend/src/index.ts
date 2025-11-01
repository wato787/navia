import { Hono } from "hono";
import { serve } from "bun";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello from Hono on Bun" }));
app.get("/healthz", (c) => c.text("ok"));

const port = Number(process.env.PORT ?? 8787);

serve({
  port,
  fetch: app.fetch
});

console.log(`Hono server ready on http://localhost:${port}`);
