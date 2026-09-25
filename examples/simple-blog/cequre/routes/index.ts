import { CequreModule } from "cequre-ts";
import type { Collections } from "../_generated/server";
import { registerHooks } from "../hooks";
import { registerAccess } from "../access";
import { registerAuthRoutes } from "./auth";

export const routesModule = new CequreModule<Collections>();

// Register modular lifecycle hooks
registerHooks(routesModule);

// Register modular access control policies
registerAccess(routesModule);

// Register modular custom HTTP routes
registerAuthRoutes(routesModule);
