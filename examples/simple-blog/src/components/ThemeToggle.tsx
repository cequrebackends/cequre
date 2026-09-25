import { onSettled } from "solid-js";
import { theme, resolvedTheme, setTheme, initTheme } from "../lib/theme";

export function ThemeToggle() {
  onSettled(() => {
    initTheme();
  });

  return (
    <div
      class="inline-flex items-center p-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800/80 border border-stone-300/60 dark:border-stone-700 transition-colors"
      role="group"
      aria-label="Theme selection"
    >
      {/* System Default Option */}
      <button
        type="button"
        onClick={() => setTheme("system")}
        class={[
          "flex items-center justify-center w-7 h-7 rounded-full transition-all cursor-pointer",
          theme() === "system"
            ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200",
        ]}
        title={`System Default (${resolvedTheme() === "dark" ? "Dark" : "Light"})`}
        aria-label="System Theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      </button>

      {/* Light Mode Option */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        class={[
          "flex items-center justify-center w-7 h-7 rounded-full transition-all cursor-pointer",
          theme() === "light"
            ? "bg-white text-amber-600 shadow-xs"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200",
        ]}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </button>

      {/* Dark Mode Option */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        class={[
          "flex items-center justify-center w-7 h-7 rounded-full transition-all cursor-pointer",
          theme() === "dark"
            ? "bg-stone-700 text-indigo-300 shadow-xs"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200",
        ]}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </button>
    </div>
  );
}
