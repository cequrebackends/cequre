import type { CequreModule } from "cequre-ts";
import type { Collections } from "../_generated/server";

export function registerPostsAccess(module: CequreModule<Collections>) {
  module.access("posts", {
    read: () => true,
    create: (ctx) => ctx.user !== null,
    update: (ctx) => {
      if (!ctx.user) return false;
      if (ctx.user.role === "admin") return true;
      return { author: { eq: ctx.user.id } };
    },
    delete: (ctx) => {
      if (!ctx.user) return false;
      if (ctx.user.role === "admin") return true;
      return { author: { eq: ctx.user.id } };
    },
  });
}
