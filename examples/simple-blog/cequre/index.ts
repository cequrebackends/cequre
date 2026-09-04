import { createCequre } from "./_generated/server";
import { SQLiteAdapter, defaultSecurity, defaultMonitoring } from "cequre-ts";
export const app = createCequre({
  adapter: new SQLiteAdapter(process.env.DATABASE_URL!),
  plugins: [defaultSecurity(), defaultMonitoring()]
});

app.start({ port: Number(process.env.PORT) || 3000 }).catch(console.error);
