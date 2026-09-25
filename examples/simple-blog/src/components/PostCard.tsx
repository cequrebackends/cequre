import type { PostsPopulated } from "../lib/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface PostCardProps {
  post: PostsPopulated;
  featured?: boolean;
}

export function PostCard(props: PostCardProps) {
  const post = () => props.post;
  const author = () => (typeof post().author === "object" ? (post().author as any) : null);
  const authorName = () => author()?.name || "Chronicle Contributor";
  const authorAvatar = () =>
    author()?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName())}`;

  const formattedDate = () => {
    try {
      return dayjs(post().createdAt).format("MMM D, YYYY");
    } catch {
      return "Recently";
    }
  };

  const defaultCover = (category: string) => {
    switch (category) {
      case "Technology":
        return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop";
      case "Design":
        return "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop";
      case "Engineering":
        return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop";
      case "Architecture":
        return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop";
    }
  };

  return (
    <article
      class={[
        "group flex flex-col justify-between bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-200",
        props.featured ? "md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-12 lg:gap-8" : "",
      ]}
    >
      {/* Cover Image */}
      <div
        class={[
          "overflow-hidden bg-stone-100 dark:bg-stone-800 relative",
          props.featured ? "lg:col-span-7 h-64 sm:h-80 lg:h-full" : "h-52",
        ]}
      >
        <img
          src={post().coverImage || defaultCover(post().category)}
          alt={post().title}
          class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div class="absolute top-4 left-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-white/90 dark:bg-stone-900/90 backdrop-blur text-stone-900 dark:text-stone-100 shadow-sm">
            {post().category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div class={["p-6 sm:p-8 flex flex-col justify-between", props.featured ? "lg:col-span-5" : "flex-1"]}>
        <div>
          <div class="flex items-center gap-3 text-xs font-mono text-stone-500 dark:text-stone-400 mb-3">
            <span>{formattedDate()}</span>
            <span>•</span>
            <span>{post().readingTime || 3} min read</span>
          </div>

          <a
            href={`/post/${post().id}`}
            class="block text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors"
          >
            <h3
              class={[
                "font-serif font-bold text-stone-900 dark:text-stone-100 leading-snug tracking-tight mb-3",
                props.featured ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl",
              ]}
            >
              {post().title}
            </h3>
          </a>

          <p class="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
            {post().summary ||
              post()
                .content.substring(0, 160)
                .replace(/[#*`_]/g, "") + "..."}
          </p>
        </div>

        {/* Author Footer */}
        <div class="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img
              src={authorAvatar()}
              alt={authorName()}
              referrerpolicy="no-referrer"
              class="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-700 object-cover bg-stone-100 dark:bg-stone-800"
            />
            <div>
              <p class="text-xs font-medium text-stone-900 dark:text-stone-100 leading-none">{authorName()}</p>
              <p class="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">Author</p>
            </div>
          </div>

          <a
            href={`/post/${post().id}`}
            class="text-xs font-mono font-medium text-stone-800 dark:text-stone-300 group-hover:text-amber-800 dark:group-hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            Read Story
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
