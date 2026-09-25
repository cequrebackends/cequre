import { createCequre } from "./_generated/server";
import { SQLiteAdapter, defaultSecurity, defaultMonitoring } from "cequre-ts";
import { routesModule } from "./routes";

export const app = createCequre({
  adapter: new SQLiteAdapter(process.env.DATABASE_URL || "file:./temp/vite-project.sqlite"),
  plugins: [defaultSecurity(), defaultMonitoring()],
}).use(routesModule);

app.start({ port: Number(process.env.PORT) || 3000 }).catch(console.error);
