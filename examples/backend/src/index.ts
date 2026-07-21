import { app } from "./app";

// Import modules so they register with the app
import "./access";
import "./custom-routes";

// Default root index page serving from public directory
app.router.get("/", () => {
  return new Response(Bun.file("public/index.html"));
});

// Basic health check for uptime monitoring and container probes
app.router.get("/health", () => {
  return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
    headers: { "Content-Type": "application/json" },
  });
});

app.start({ port: process.env.PORT ? parseInt(process.env.PORT) : 3000 }).catch(console.error);
