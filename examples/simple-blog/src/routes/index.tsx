import { createSignal, onSettled, For, Show, createMemo } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { getPostsServer, seedCuratedArticlesServer, type PostsPopulated } from "../lib/api";
import { PostCard } from "../components/PostCard";
import { isAuthenticated } from "../lib/auth";

const CATEGORIES = ["All", "Technology", "Engineering", "Design", "Architecture", "Culture"] as const;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [posts, setPosts] = createSignal<PostsPopulated[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isSeeding, setIsSeeding] = createSignal(false);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getPostsServer();
      setPosts(data);
    } catch (err) {
      console.error("Network error loading posts via server function:", err);
    } finally {
      setIsLoading(false);
    }
  };

  onSettled(() => {
    loadPosts();
  });

  const activeCategory = () => (searchParams.category as string) || "All";

  const filteredPosts = createMemo(() => {
    const all = posts();
    const cat = activeCategory();
    const q = searchQuery().toLowerCase().trim();
    const results: PostsPopulated[] = [];

    for (const post of all) {
      const matchesCat = cat === "All" || post.category === cat;
      const authorName = typeof post.author === "object" && post.author ? post.author.name : "";
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.summary && post.summary.toLowerCase().includes(q)) ||
        authorName.toLowerCase().includes(q);

      if (matchesCat && matchesSearch) {
        results.push(post);
      }
    }
    return results;
  });

  const featuredPost = createMemo(() => {
    const items = filteredPosts();
    return items.length > 0 ? items[0] : null;
  });

  const regularPosts = createMemo(() => {
    const items = filteredPosts();
    return items.length > 1 ? items.slice(1) : [];
  });

  // Seed sample editorial essays via server function
  const handleSeedSampleStories = async () => {
    setIsSeeding(true);
    try {
      const res = await seedCuratedArticlesServer();
      if (res.success) {
        await loadPosts();
      }
    } catch (err) {
      console.error("Failed to seed sample stories:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header & Masthead */}
      <section class="border-b border-stone-200 dark:border-stone-800 pb-12 mb-10 text-center sm:text-left transition-colors">
        <div class="sm:flex sm:items-end sm:justify-between">
          <div>
            <span class="text-xs font-mono tracking-widest text-amber-800 dark:text-amber-400 uppercase font-semibold">
              Volume IV • Issue 09
            </span>
            <h1 class="font-serif text-4xl sm:text-6xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-2 mb-4 leading-none">
              Dispatches on Code & Craft
            </h1>
            <p class="text-stone-600 dark:text-stone-400 text-lg sm:text-xl max-w-2xl font-normal leading-relaxed">
              Curated long-form essays, architecture patterns, and technical reflections from independent builders.
            </p>
          </div>

          <div class="mt-6 sm:mt-0 flex items-center justify-center gap-3">
            <Show when={isAuthenticated()}>
              <a
                href="/write"
                class="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow"
              >
                Write an Article
              </a>
            </Show>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div class="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-stone-200/60 dark:border-stone-800/80">
          {/* Category Tabs */}
          <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <For each={CATEGORIES}>
              {(category) => (
                <button
                  onClick={() => setSearchParams({ category: category === "All" ? undefined : category })}
                  class={[
                    "px-4 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all whitespace-nowrap cursor-pointer",
                    activeCategory() === category
                      ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm font-semibold"
                      : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500",
                  ]}
                >
                  {category}
                </button>
              )}
            </For>
          </div>

          {/* Search Bar */}
          <div class="relative w-full md:w-72">
            <input
              type="search"
              placeholder="Search stories & authors..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full px-4 py-2 pl-9 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors shadow-sm"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <Show
        when={!isLoading()}
        fallback={
          <div class="py-24 text-center">
            <div class="inline-block w-8 h-8 border-2 border-stone-900 dark:border-stone-100 border-t-transparent rounded-full animate-spin" />
            <p class="mt-4 text-sm font-mono text-stone-500 dark:text-stone-400">
              Retrieving articles from Cequre backend...
            </p>
          </div>
        }
      >
        <Show
          when={filteredPosts().length > 0}
          fallback={
            <div class="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 shadow-sm">
              <div class="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400 dark:text-stone-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
              </div>
              <h2 class="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">No Articles Found</h2>
              <p class="text-stone-600 dark:text-stone-400 max-w-md mx-auto text-sm mb-6 leading-relaxed">
                {searchQuery() || activeCategory() !== "All"
                  ? "No published stories match your search criteria. Try a different term or category filter."
                  : "The journal database is currently empty. You can write your own story or seed initial curated editorial essays."}
              </p>

              <div class="flex items-center justify-center gap-3">
                <Show when={isAuthenticated()}>
                  <a
                    href="/write"
                    class="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                  >
                    Write the First Story
                  </a>
                </Show>
                <button
                  onClick={handleSeedSampleStories}
                  disabled={isSeeding()}
                  class="px-5 py-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-full text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSeeding() ? "Publishing Stories..." : "Seed Curated Editorial Articles"}
                </button>
              </div>
            </div>
          }
        >
          {/* Featured Hero Story */}
          <Show when={featuredPost()}>
            {(hero) => (
              <div class="mb-14">
                <PostCard post={hero()} featured={true} />
              </div>
            )}
          </Show>

          {/* Regular Article Grid */}
          <Show when={regularPosts().length > 0}>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <For each={regularPosts()}>{(post) => <PostCard post={post} />}</For>
            </div>
          </Show>
        </Show>
      </Show>
    </div>
  );
}
