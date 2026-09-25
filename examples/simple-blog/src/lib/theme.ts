import { createSignal } from "solid-js";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "chronicle_theme";

// Currently active setting: 'light' | 'dark' | 'system' (defaults to 'system')
export const [theme, setThemeSignal] = createSignal<Theme>("system");

// Actual resolved theme in the DOM: 'light' | 'dark'
export const [resolvedTheme, setResolvedTheme] = createSignal<"light" | "dark">("light");

export function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;

  const resolved = t === "system" ? getSystemPreference() : t;
  setResolvedTheme(resolved);

  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
}

export function setTheme(newTheme: Theme) {
  setThemeSignal(newTheme);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Could not save theme to localStorage:", e);
    }
  }
  applyTheme(newTheme);
}

let initialized = false;

export function initTheme() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initialTheme: Theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";

    setThemeSignal(initialTheme);
    applyTheme(initialTheme);

    // Watch for OS system preference changes reactively
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (theme() === "system") {
        applyTheme("system");
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleMediaChange);
    }
  } catch (e) {
    console.warn("Failed initializing theme system:", e);
  }
}
