import { createSignal, Show } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { register } from "../lib/auth";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  const effectiveError = () => errorMessage() || (searchParams.error ? String(searchParams.error) : "");

  const handleRegister = async (e: Event) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name() || !email() || !password()) {
      setErrorMessage("Please fill out name, email, and password.");
      return;
    }

    if (password().length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const result = await register(name().trim(), email().trim(), password(), bio().trim() || undefined);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Registration failed. Please check your details.");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div class="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 sm:p-10 shadow-sm transition-colors">
        <div class="text-center mb-8">
          <span class="text-xs font-mono tracking-widest text-amber-800 dark:text-amber-400 uppercase font-semibold">
            Join the Guild
          </span>
          <h1 class="font-serif text-3xl font-black text-stone-900 dark:text-stone-100 mt-1">Create Author Account</h1>
          <p class="text-stone-500 dark:text-stone-400 text-sm mt-2">
            Publish thoughtful essays and architecture critiques on Chronicle.
          </p>
        </div>

        <Show when={effectiveError()}>
          <div class="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-sm rounded-xl flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 shrink-0 text-red-500 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" y2="12" />
              <line x1="12" y1="16" y2="16" />
            </svg>
            <div>{effectiveError()}</div>
          </div>
        </Show>

        <a
          href="http://localhost:3000/api/auth/google"
          class="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-medium text-sm rounded-full border border-stone-300 dark:border-stone-700 transition-all shadow-xs hover:border-stone-400 dark:hover:border-stone-600 active:scale-[0.98] cursor-pointer"
        >
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </a>

        <div class="relative my-6 text-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-stone-200 dark:border-stone-800" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white dark:bg-stone-900 px-3 text-stone-400 dark:text-stone-500 font-mono tracking-wider">
              or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleRegister} class="space-y-4">
          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              autocomplete="name"
              required
              placeholder="Elena Vance"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              class="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-sm focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              autocomplete="email"
              required
              placeholder="elena@chronicle.journal"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-sm focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
              Password (min 6 characters) *
            </label>
            <input
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              placeholder="••••••••••••"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-sm focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
              Author Bio (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Staff Software Engineer, writing about distributed protocols..."
              value={bio()}
              onInput={(e) => setBio(e.currentTarget.value)}
              class="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-sm focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading()}
            class="w-full py-3 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-medium text-sm rounded-full transition-all shadow active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isLoading() ? "Creating Profile on Cequre..." : "Create Chronicle Account"}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400">
          Already an author?{" "}
          <a
            href="/login"
            class="font-medium text-stone-900 dark:text-stone-100 hover:text-amber-800 dark:hover:text-amber-400 underline transition-colors"
          >
            Sign in to existing account
          </a>
        </div>
      </div>
    </div>
  );
}
