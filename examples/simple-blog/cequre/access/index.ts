import type { CequreModule } from "cequre-ts";
import type { Collections } from "../_generated/server";
import { registerUsersAccess } from "./users";
import { registerPostsAccess } from "./posts";

export function registerAccess(module: CequreModule<Collections>) {
  registerUsersAccess(module);
  registerPostsAccess(module);
}
