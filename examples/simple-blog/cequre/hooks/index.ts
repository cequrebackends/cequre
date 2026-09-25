import type { CequreModule } from "cequre-ts";
import { registerPostsHooks } from "./posts";
import type { Collections } from "../_generated/server";

export function registerHooks(module: CequreModule<Collections>) {
  registerPostsHooks(module);
}
