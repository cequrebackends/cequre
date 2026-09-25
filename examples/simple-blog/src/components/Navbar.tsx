import { useNavigate } from "@solidjs/router";
import { user, logout, isAuthenticated } from "../lib/auth";
import { createSignal, Show } from "solid-js";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = createSignal(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header class="border-b border-stone-200 dark:border-stone-800 bg-[#faf9f6]/95 dark:bg-[#121214]/95 backdrop-blur sticky top-0 z-50 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          {/* Masthead Branding */}
          <div class="flex items-center gap-6">
            <a href="/" class="group flex items-baseline gap-2 text-inherit no-underline">
              <span class="font-serif text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                CHRONICLE
              </span>
              <span class="hidden sm:inline-block text-xs font-mono tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                / JOURNAL
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav class="flex items-center gap-4 sm:gap-6">
            <a
              href="/"
              class="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors"
            >
              Explore
            </a>

            <Show when={isAuthenticated()}>
              <a
                href="/dashboard"
                class="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/write"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-full hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-sm active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Write Story
              </a>
            </Show>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Auth Actions */}
            <Show
              when={isAuthenticated()}
              fallback={
                <div class="flex items-center gap-3">
                  <a
                    href="/login"
                    class="text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white px-3 py-2 transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    class="px-4 py-2 text-sm font-medium text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-full hover:border-stone-900 dark:hover:border-stone-100 transition-colors"
                  >
                    Join
                  </a>
                </div>
              }
            >
              <div class="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen())}
                  class="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-stone-300 dark:hover:ring-stone-700 transition-all cursor-pointer"
                  aria-label="User menu"
                >
                  <img
                    src={
                      user()?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user()?.name || "User")}`
                    }
                    alt={user()?.name || "Author"}
                    referrerpolicy="no-referrer"
                    class="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 object-cover"
                  />
                  <span class="hidden md:inline-block text-sm font-medium text-stone-800 dark:text-stone-200 max-w-30 truncate">
                    {user()?.name}
                  </span>
                </button>

                <Show when={dropdownOpen()}>
                  <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-100 dark:border-stone-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div class="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                      <p class="text-xs text-stone-500 dark:text-stone-400 font-mono">Signed in as</p>
                      <p class="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{user()?.email}</p>
                    </div>
                    <a
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      class="block px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                    >
                      My Stories & Drafts
                    </a>
                    <a
                      href="/write"
                      onClick={() => setDropdownOpen(false)}
                      class="block px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                    >
                      New Article
                    </a>
                    <div class="border-t border-stone-100 dark:border-stone-800 my-1" />
                    <button
                      onClick={handleLogout}
                      class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </Show>
              </div>
            </Show>
          </nav>
        </div>
      </div>
    </header>
  );
}
