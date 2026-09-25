import { createSignal } from "solid-js";
import type { Users } from "./api";
import { loginServerAction, registerServerAction, logoutServerAction, getCurrentUserServer } from "./server";

// Reactive auth state signals
const [user, setUser] = createSignal<Users | null>(null);
const [isAuthLoading, setIsAuthLoading] = createSignal(true);

// Initialize auth state by verifying session cookie via server function
export async function initAuth() {
  if (typeof window === "undefined") {
    setIsAuthLoading(false);
    return;
  }

  try {
    // 1. Instant optimistic hydration from cache if available
    const cachedUser = localStorage.getItem("cequre_user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {}
    }

    // 2. Validate current session against server using the httpOnly cookie
    const serverUser = await getCurrentUserServer();
    if (serverUser) {
      setUser(serverUser);
      localStorage.setItem("cequre_user", JSON.stringify(serverUser));
    } else {
      // Cookie is missing, expired, or invalid
      setUser(null);
      localStorage.removeItem("cequre_user");
    }
  } catch (err) {
    console.warn("Session verification warning:", err);
  } finally {
    setIsAuthLoading(false);
  }
}

// User login via server function
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await loginServerAction({ email, password });
    if (!res.success || !res.user) {
      return { success: false, error: res.error || "Invalid credentials" };
    }

    setUser(res.user);
    if (typeof window !== "undefined") {
      localStorage.setItem("cequre_user", JSON.stringify(res.user));
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred during login." };
  }
}

// User registration via server function
export async function register(
  name: string,
  email: string,
  password: string,
  bio?: string,
  avatar?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await registerServerAction({
      name,
      email,
      password,
      bio: bio || "",
      avatar: avatar || "",
    });
    if (!res.success || !res.user) {
      return { success: false, error: res.error || "Registration failed" };
    }

    setUser(res.user);
    if (typeof window !== "undefined") {
      localStorage.setItem("cequre_user", JSON.stringify(res.user));
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred during registration." };
  }
}

// User logout via server function
export async function logout() {
  try {
    await logoutServerAction();
  } catch (err) {
    console.error("Logout server error:", err);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cequre_user");
    }
    setUser(null);
  }
}

export { user, isAuthLoading };
export const isAuthenticated = () => !!user();
