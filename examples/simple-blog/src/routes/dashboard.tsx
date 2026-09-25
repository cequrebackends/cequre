import { createSignal, createEffect, onSettled, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { getUserPostsServer, deletePostServer, type PostsPopulated } from "../lib/api";
import { user, isAuthenticated, logout, isAuthLoading } from "../lib/auth";
import dayjs from "dayjs";

export default function Dashboard() {
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = createSignal<PostsPopulated[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);
  const [deleteError, setDeleteError] = createSignal("");

  const loadMyPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getUserPostsServer();
      setMyPosts(data);
    } catch (err) {
      console.error("Error fetching author posts via server function:", err);
    } finally {
      setIsLoading(false);
    }
  };

  createEffect(
    () => isAuthenticated(),
    (auth) => {
      if (auth) {
        loadMyPosts();
      }
    },
  );

  onSettled(() => {
    if (isAuthenticated()) {
      loadMyPosts();
    }
  });

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to permanently delete this story?")) return;

    setDeletingId(postId);
    setDeleteError("");
    try {
      const res = await deletePostServer(postId);
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete post.");
      } else {
        await loadMyPosts();
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete story.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalReadingMinutes = () => {
    const posts = myPosts();
    return posts.reduce((sum: number, p: PostsPopulated) => sum + (p.readingTime || 3), 0);
  };

  return (
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Show
        when={!isAuthLoading()}
        fallback={
          <div class="py-20 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 shadow-sm">
            <div class="inline-block w-8 h-8 border-2 border-stone-900 dark:border-stone-100 border-t-transparent rounded-full animate-spin" />
            <p class="mt-3 text-sm font-mono text-stone-500 dark:text-stone-400">
              Checking author workspace credentials...
            </p>
          </div>
        }
      >
        <Show
          when={isAuthenticated()}
          fallback={
            <div class="py-20 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 shadow-sm">
              <h2 class="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">Author Dashboard</h2>
              <p class="text-stone-600 dark:text-stone-400 text-sm mb-6">
                Please sign in to access your personal author studio.
              </p>
              <a
                href="/login"
                class="px-6 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors inline-block"
              >
                Sign In
              </a>
            </div>
          }
        >
          <div class="space-y-10">
            {/* Author Profile Banner */}
            <div class="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 sm:p-10 shadow-sm transition-colors">
              <div class="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <img
                    src={
                      user()?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user()?.name || "Author")}`
                    }
                    alt={user()?.name || "Author"}
                    referrerpolicy="no-referrer"
                    class="w-20 h-20 rounded-full border-2 border-stone-200 dark:border-stone-700 object-cover bg-stone-100 dark:bg-stone-800 shrink-0"
                  />
                  <div>
                    <span class="text-xs font-mono tracking-widest text-amber-800 dark:text-amber-400 uppercase font-semibold">
                      Author Workspace
                    </span>
                    <h1 class="font-serif text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1">
                      {user()?.name}
                    </h1>
                    <p class="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">{user()?.email}</p>
                    <Show when={user()?.bio}>
                      <p class="text-stone-600 dark:text-stone-300 text-sm mt-3 max-w-xl leading-relaxed">
                        {user()?.bio}
                      </p>
                    </Show>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <a
                    href="/write"
                    class="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-sm font-medium rounded-full shadow transition-all flex items-center gap-2 active:scale-95"
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
                    New Story
                  </a>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    class="px-4 py-2 text-sm text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-700 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-stone-100 dark:border-stone-800">
                <div class="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
                  <p class="text-xs font-mono text-stone-500 dark:text-stone-400 uppercase">Stories Published</p>
                  <p class="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {myPosts().length}
                  </p>
                </div>
                <div class="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
                  <p class="text-xs font-mono text-stone-500 dark:text-stone-400 uppercase">Total Reading Cadence</p>
                  <p class="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {totalReadingMinutes()} min
                  </p>
                </div>
                <div class="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
                  <p class="text-xs font-mono text-stone-500 dark:text-stone-400 uppercase">Role / Access</p>
                  <p class="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1 capitalize">
                    {user()?.role || "Writer"}
                  </p>
                </div>
                <div class="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
                  <p class="text-xs font-mono text-stone-500 dark:text-stone-400 uppercase">Backend Security</p>
                  <p class="text-2xl font-serif font-bold mt-1 text-emerald-800 dark:text-emerald-400">Active (RLS)</p>
                </div>
              </div>
            </div>

            {/* Stories Section */}
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Your Articles & Publications
                </h2>
                <span class="text-xs font-mono text-stone-500 dark:text-stone-400">{myPosts().length} stories</span>
              </div>

              <Show when={deleteError()}>
                <div class="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-sm rounded-xl">
                  {deleteError()}
                </div>
              </Show>

              <Show
                when={!isLoading()}
                fallback={
                  <div class="py-16 text-center">
                    <div class="inline-block w-8 h-8 border-2 border-stone-900 dark:border-stone-100 border-t-transparent rounded-full animate-spin" />
                    <p class="mt-3 text-sm font-mono text-stone-500 dark:text-stone-400">
                      Querying your authored stories...
                    </p>
                  </div>
                }
              >
                <Show
                  when={myPosts().length > 0}
                  fallback={
                    <div class="py-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
                      <div class="w-12 h-12 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <h3 class="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                        You haven't written any stories yet
                      </h3>
                      <p class="text-stone-600 dark:text-stone-400 text-sm mb-6 max-w-sm mx-auto">
                        Share your technical reflections, architecture decisions, or design insights with the Chronicle
                        readership.
                      </p>
                      <a
                        href="/write"
                        class="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors inline-block"
                      >
                        Draft Your First Article
                      </a>
                    </div>
                  }
                >
                  <div class="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm divide-y divide-stone-100 dark:divide-stone-800">
                    <For each={myPosts()}>
                      {(post) => (
                        <div class="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                          <div class="space-y-2 flex-1">
                            <div class="flex items-center gap-3">
                              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                                {post.category}
                              </span>
                              <span class="text-xs font-mono text-stone-400 dark:text-stone-500">
                                {dayjs(post.createdAt).format("MMM D, YYYY")}
                              </span>
                              <span class="text-xs font-mono text-stone-400 dark:text-stone-500">
                                • {post.readingTime || 3} min read
                              </span>
                            </div>

                            <a href={`/post/${post.id}`} class="block group">
                              <h3 class="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors">
                                {post.title}
                              </h3>
                            </a>

                            <Show when={post.summary}>
                              <p class="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">{post.summary}</p>
                            </Show>
                          </div>

                          <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <a
                              href={`/post/${post.id}`}
                              class="px-3.5 py-1.5 text-xs font-mono font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                            >
                              View
                            </a>
                            <a
                              href={`/edit/${post.id}`}
                              class="px-3.5 py-1.5 text-xs font-mono font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                            >
                              Edit
                            </a>
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId() === post.id}
                              class="px-3.5 py-1.5 text-xs font-mono font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 rounded-full hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId() === post.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </Show>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
}
