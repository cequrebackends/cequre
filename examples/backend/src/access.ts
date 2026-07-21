import { app } from "./app";

// Attach access control rules
app.access("users", {
  create: () => true,
  read: (ctx) => ctx.user?.role === "admin" || ctx.user?.id === ctx.doc?.id,
  update: (ctx) => ctx.user?.role === "admin" || ctx.user?.id === ctx.doc?.id,
  delete: (ctx) => ctx.user?.role === "admin" || ctx.user?.id === ctx.doc?.id,
});
