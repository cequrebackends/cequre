import { createSignal, onSettled, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { getPostByIdServer, deletePostServer, type PostsPopulated } from "../../lib/api";
import { user } from "../../lib/auth";
import { Markdown } from "../../components/Markdown";
import dayjs from "dayjs";

export default function PostDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [post, setPost] = createSignal<PostsPopulated | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);

  const loadPost = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getPostByIdServer(id);
      if (data) {
        setPost(data);
      }
    } catch (err) {
      console.error("Failed to load post via server function:", err);
    } finally {
      setIsLoading(false);
    }
  };

  onSettled(() => {
    if (params.id) {
      loadPost(params.id);
    }
  });

  const authorObj = () => (post() && typeof post()!.author === "object" ? (post()!.author as any) : null);
  const authorId = () => {
    const a = authorObj();
    if (a) return a.id;
    return (post()?.author as unknown as string) || "";
  };

  const isOwner = () => {
    const current = user();
    if (!current) return false;
    if (current.role === "admin") return true;
    return current.id === authorId();
  };

  const formattedDate = () => {
    if (!post()?.createdAt) return "";
    return dayjs(post()!.createdAt).format("MMMM D, YYYY");
  };

  const handleDelete = async () => {
    if (!post()) return;
    setIsDeleting(true);
    try {
      const res = await deletePostServer(post()!.id);
      if (!res.success) {
        alert("Failed to delete story: " + (res.error || "Unknown error"));
        setIsDeleting(false);
        return;
      }
      navigate("/");
    } catch (err: any) {
      alert("Error deleting story: " + err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="mb-8">
        <a
          href="/"
          class="inline-flex items-center gap-2 text-sm font-mono text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Journal
        </a>
      </div>

      <Show
        when={!isLoading()}
        fallback={
          <div class="py-24 text-center">
            <div class="inline-block w-8 h-8 border-2 border-stone-900 dark:border-stone-100 border-t-transparent rounded-full animate-spin" />
            <p class="mt-4 text-sm font-mono text-stone-500 dark:text-stone-400">Opening story...</p>
          </div>
        }
      >
        <Show
          when={post()}
          fallback={
            <div class="py-20 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
              <h2 class="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Story Not Found</h2>
              <p class="text-stone-600 dark:text-stone-400 text-sm mb-6">
                This article may have been removed or the link is incorrect.
              </p>
              <a
                href="/"
                class="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium inline-block"
              >
                Return to Front Page
              </a>
            </div>
          }
        >
          <article>
            <div class="border-b border-stone-200 dark:border-stone-800 pb-8 mb-10">
              <div class="flex items-center gap-3 mb-4">
                <span class="px-3 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-xs font-mono font-semibold tracking-wider text-amber-900 dark:text-amber-400 uppercase">
                  {post()!.category}
                </span>
                <span class="text-xs font-mono text-stone-500 dark:text-stone-400">
                  {post()!.readingTime || 3} min read
                </span>
              </div>

              <h1 class="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-stone-950 dark:text-stone-50 tracking-tight leading-tight mb-6">
                {post()!.title}
              </h1>

              <Show when={post()!.summary}>
                <p class="text-lg sm:text-xl text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-8">
                  {post()!.summary}
                </p>
              </Show>

              <div class="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-stone-100 dark:border-stone-800">
                <div class="flex items-center gap-4">
                  <img
                    src={
                      authorObj()?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorObj()?.name || "Author")}`
                    }
                    alt={authorObj()?.name || "Author"}
                    referrerpolicy="no-referrer"
                    class="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-700 object-cover bg-stone-100 dark:bg-stone-800"
                  />
                  <div>
                    <p class="font-medium text-stone-900 dark:text-stone-100 leading-none">
                      {authorObj()?.name || "Chronicle Writer"}
                    </p>
                    <p class="text-xs font-mono text-stone-500 dark:text-stone-400 mt-1">
                      Published on {formattedDate()}
                    </p>
                  </div>
                </div>

                <Show when={isOwner()}>
                  <div class="flex items-center gap-2">
                    <a
                      href={`/edit/${post()!.id}`}
                      class="px-4 py-1.5 text-xs font-mono font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      Edit Story
                    </a>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      class="px-4 py-1.5 text-xs font-mono font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-full hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </Show>
              </div>
            </div>

            <Show when={post()!.coverImage}>
              <div class="mb-12 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm max-h-125">
                <img src={post()!.coverImage} alt={post()!.title} class="w-full h-full object-cover object-center" />
              </div>
            </Show>

            <Markdown content={post()!.content} class="article-prose max-w-none mb-16" />

            <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm transition-colors">
              <img
                src={
                  authorObj()?.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorObj()?.name || "Author")}`
                }
                alt={authorObj()?.name || "Author"}
                referrerpolicy="no-referrer"
                class="w-16 h-16 rounded-full border border-stone-200 dark:border-stone-700 object-cover bg-stone-100 dark:bg-stone-800 shrink-0"
              />
              <div class="text-center sm:text-left">
                <span class="text-xs font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Written by
                </span>
                <h3 class="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 mb-2">
                  {authorObj()?.name || "Chronicle Writer"}
                </h3>
                <p class="text-stone-600 dark:text-stone-400 text-sm leading-relaxed max-w-xl">
                  {authorObj()?.bio ||
                    "Author and contributor to Chronicle Journal, exploring the intersection of modern software systems and architecture."}
                </p>
              </div>
            </div>
          </article>
        </Show>
      </Show>

      <Show when={showDeleteModal()}>
        <div class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 shadow-2xl">
            <h3 class="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Delete this story?</h3>
            <p class="text-stone-600 dark:text-stone-400 text-sm mb-6">
              Are you sure you want to remove "
              <span class="font-medium text-stone-900 dark:text-stone-100">{post()?.title}</span>"? This action is
              irreversible.
            </p>
            <div class="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting()}
                class="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting()}
                class="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting() ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
