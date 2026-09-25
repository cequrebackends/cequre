import type { CequreModule } from "cequre-ts";
import type { Collections } from "../_generated/server";

export function registerUsersAccess(module: CequreModule<Collections>) {
  module.access("users", {
    register: () => true,
    login: () => true,
    read: () => true,
    create: () => true,
    update: (ctx) => {
      if (!ctx.user) return false;
      if (ctx.user.role === "admin") return true;
      return { id: { eq: ctx.user.id } };
    },
    delete: (ctx) => ctx.user?.role === "admin",
  });
}
