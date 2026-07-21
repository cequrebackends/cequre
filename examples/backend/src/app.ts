import { createCequre } from "../cequre/_generated/server";
import { sqlite } from "@cequrebackends/cequre-plugin-sqlite";
import { defaultSecurity } from "@cequrebackends/cequre-plugin-security";
import { defaultMonitoring } from "@cequrebackends/cequre-plugin-monitoring";

// You are currently using the Bun adapter for maximum performance.
// Cequre is runtime-agnostic. To deploy to a different environment, 
// simply swap this import for the respective adapter (e.g., withNode, withCloudflare).
import { withBun } from "@cequrebackends/cequre-ts/adapters/bun";

export const app = createCequre(withBun({
  adapter: sqlite({ url: process.env.DATABASE_URL! }),
  plugins: [defaultSecurity(), defaultMonitoring()]
}));

export type APP = typeof app;
