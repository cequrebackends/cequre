import { app } from "./app";
import { t } from "@cequrebackends/cequre-ts";

// Custom routes
app.router.get(
  "/greeting",
  () => ({ greeting: "hello from cequre" }),
  {
    response: t.Object({
      greeting: t.String(),
    }),
  }
);

app.router.get("/my-stream", async (ctx) => {
  // Streams plain text sequentially
  await ctx.stream("chunk 1", { delay: 500 });
  await ctx.stream("chunk 2", { delay: 500 });

  // Streams an object as JSON automatically
  await ctx.stream({ finish: true });

  // Return an empty object to satisfy the route handler type requirement.
  // Under the hood, ctx.stream() hijacks the router lifecycle and will safely ignore this return value.
  return {};
});
