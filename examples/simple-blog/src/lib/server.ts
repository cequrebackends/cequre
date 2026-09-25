"use server";

import { getRequestEvent, parseCookieHeader, serializeCookie } from "@solidjs/web";
import { createCequreClient, type PostsPopulated, type Users } from "../../cequre/_generated/client";

const CEQURE_SERVER_URL = "http://localhost:3000";

/**
 * Extracts the cequre_access_token from the incoming request's Cookie header
 */
function getAuthTokenFromCookie(): string | null {
  const event = getRequestEvent();
  if (!event) return null;
  const cookieHeader = event.request.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);
  return cookies["cequre_access_token"] || cookies["cequre_auth"] || null;
}

/**
 * Sets an httpOnly cookie with the Cequre accessToken on the outgoing response
 */
function setAuthCookie(token: string) {
  const event = getRequestEvent();
  if (event && (event as any).response) {
    const cookie = serializeCookie("cequre_access_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    (event as any).response.headers.append("Set-Cookie", cookie);
  }
}

/**
 * Clears authentication session cookies
 */
function clearAuthCookie() {
  const event = getRequestEvent();
  if (event && (event as any).response) {
    const clearOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    };
    (event as any).response.headers.append("Set-Cookie", serializeCookie("cequre_access_token", "", clearOpts));
    (event as any).response.headers.append("Set-Cookie", serializeCookie("cequre_auth", "", clearOpts));
    (event as any).response.headers.append("Set-Cookie", serializeCookie("cequre_auth_refresh", "", clearOpts));
  }
}

// Instantiate server-scoped Cequre client that dynamically resolves bearer token from cookie
const serverClient = createCequreClient({
  baseUrl: CEQURE_SERVER_URL,
  getToken: () => getAuthTokenFromCookie(),
});

/**
 * Server action: Logs in user, sets httpOnly cookie, returns user profile
 */
export async function loginServerAction(credentials: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: Users | null; error?: string }> {
  try {
    const res = await serverClient.users.login({ email: credentials.email, password: credentials.password });
    if (res.error) {
      return { success: false, error: res.error.message || "Invalid credentials" };
    }
    if (res.data?.accessToken) {
      setAuthCookie(res.data.accessToken);
      return {
        success: true,
        user: res.data.user || null,
      };
    }
    return { success: false, error: "Authentication failed. No access token returned." };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred during login." };
  }
}

/**
 * Server action: Registers new user, sets httpOnly cookie, returns user profile
 */
export async function registerServerAction(data: {
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
}): Promise<{ success: boolean; user?: Users | null; error?: string }> {
  try {
    const res = await serverClient.users.register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "user",
      bio: data.bio || "",
      avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
    });

    if (res.error) {
      return { success: false, error: res.error.message || "Registration failed" };
    }

    if (res.data?.accessToken) {
      setAuthCookie(res.data.accessToken);
      return {
        success: true,
        user: res.data.user || null,
      };
    }

    // Fallback: log in with the newly registered credentials
    return await loginServerAction({ email: data.email, password: data.password });
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred during registration." };
  }
}

/**
 * Server action: Logs out user by expiring the auth cookie
 */
export async function logoutServerAction(): Promise<{ success: boolean }> {
  clearAuthCookie();
  return { success: true };
}

/**
 * Server query: Reads session token from cookie and retrieves current user profile
 */
export async function getCurrentUserServer(): Promise<Users | null> {
  const token = getAuthTokenFromCookie();
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    const userId = payload.sub;
    if (!userId) return null;

    const res = await serverClient.users.get({
      query: { where: { id: { eq: userId } } },
    });

    if (res.data?.docs && res.data.docs.length > 0) {
      return res.data.docs[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Server query: Fetches posts with optional category and search filters
 */
export async function getPostsServer(category?: string, query?: string): Promise<PostsPopulated[]> {
  try {
    const where: any = {};
    if (category && category !== "All") {
      where.category = { eq: category };
    }

    const res = await serverClient.posts.get({
      query: {
        depth: 1,
        where: Object.keys(where).length > 0 ? where : undefined,
      },
    });

    let docs = (res.data?.docs as PostsPopulated[]) || [];

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      docs = docs.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const summaryMatch = p.summary ? p.summary.toLowerCase().includes(q) : false;
        const authorName = typeof p.author === "object" && p.author ? p.author.name : "";
        return titleMatch || summaryMatch || authorName.toLowerCase().includes(q);
      });
    }

    return docs;
  } catch (err) {
    console.error("Error in getPostsServer:", err);
    return [];
  }
}

/**
 * Server query: Fetches a single post by ID
 */
export async function getPostByIdServer(id: string): Promise<PostsPopulated | null> {
  try {
    const res = await serverClient.posts.get({
      query: {
        depth: 1,
        where: { id: { eq: id } },
      },
    });

    if (res.data?.docs && res.data.docs.length > 0) {
      return res.data.docs[0] as PostsPopulated;
    }
    return null;
  } catch (err) {
    console.error("Error in getPostByIdServer:", err);
    return null;
  }
}

/**
 * Server action: Creates a post on Cequre backend with caller's auth token
 */
export async function createPostServer(data: {
  title: string;
  category: "Technology" | "Design" | "Engineering" | "Architecture" | "Culture";
  summary?: string;
  content: string;
  coverImage?: string;
}): Promise<{ success: boolean; post?: any; error?: string }> {
  const token = getAuthTokenFromCookie();
  if (!token) {
    return { success: false, error: "Unauthorized. Please sign in to publish." };
  }

  try {
    const parts = token.split(".");
    if (parts.length < 2) return { success: false, error: "Invalid session token." };
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    const userId = payload.sub;
    if (!userId) return { success: false, error: "Invalid user session." };

    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;

    const words = data.content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 180));

    const res = await serverClient.posts.post({
      title: data.title,
      slug,
      category: data.category,
      summary: data.summary,
      content: data.content,
      coverImage: data.coverImage,
      readingTime,
      author: userId,
      published: true,
    });

    if (res.error) {
      return { success: false, error: res.error.message || "Failed to create article" };
    }

    return { success: true, post: res.data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create article" };
  }
}

/**
 * Server action: Updates a post on Cequre backend (protected by RLS)
 */
export async function updatePostServer(
  id: string,
  data: {
    title?: string;
    category?: "Technology" | "Design" | "Engineering" | "Architecture" | "Culture";
    summary?: string;
    content?: string;
    coverImage?: string;
  },
): Promise<{ success: boolean; post?: any; error?: string }> {
  const token = getAuthTokenFromCookie();
  if (!token) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await serverClient.posts.patch(id, data);
    if (res.error) {
      return { success: false, error: res.error.message || "Failed to update article" };
    }

    return { success: true, post: res.data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update article" };
  }
}

/**
 * Server action: Deletes a post on Cequre backend (protected by RLS)
 */
export async function deletePostServer(id: string): Promise<{ success: boolean; error?: string }> {
  const token = getAuthTokenFromCookie();
  if (!token) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await serverClient.posts.delete(id);
    if (res.error) {
      return { success: false, error: res.error.message || "Failed to delete article" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete article" };
  }
}

/**
 * Server query: Fetches all posts authored by the authenticated caller
 */
export async function getUserPostsServer(): Promise<PostsPopulated[]> {
  const token = getAuthTokenFromCookie();
  if (!token) return [];

  try {
    const parts = token.split(".");
    if (parts.length < 2) return [];
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    const userId = payload.sub;
    if (!userId) return [];

    const res = await serverClient.posts.get({
      query: {
        depth: 1,
        where: { author: { eq: userId } },
      },
    });

    return (res.data?.docs as PostsPopulated[]) || [];
  } catch (err) {
    console.error("Error in getUserPostsServer:", err);
    return [];
  }
}

/**
 * Server action: Seeds initial curated articles if empty
 */
export async function seedCuratedArticlesServer(): Promise<{ success: boolean; error?: string }> {
  try {
    let authorId: string;
    const userRes = await serverClient.users.get({
      query: { where: { email: { eq: "editorial@chronicle.journal" } } },
    });

    if (userRes.data?.docs && userRes.data.docs.length > 0) {
      authorId = userRes.data.docs[0].id;
    } else {
      const createRes = await serverClient.users.register({
        name: "Elena Vance",
        email: "editorial@chronicle.journal",
        password: "EditorialPassword123!",
        role: "user",
        bio: "Principal Systems Architect & Editor-at-Large",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      });
      authorId = createRes.data?.user?.id || "system";
    }

    const samplePosts = [
      {
        title: "The Architecture of Calm Software Systems",
        slug: "the-architecture-of-calm-software-systems",
        summary:
          "Why modern engineering teams are pivoting from bloated microservice sprawl toward cohesive, deterministic architectures that respect cognitive bandwidth.",
        content: `Software development in the early 2020s was characterized by hyper-fragmentation. Teams split simple monoliths into dozens of distributed services, introducing network latency, cascading failures, and distributed transaction headaches.\n\n## Returning to First Principles\n\nWhen we step back and evaluate our core operational objectives, software reliability and human ergonomics outweigh arbitrary technical complexity. A calm system provides deterministic execution paths, type-safe boundaries, and zero-runtime-overhead abstractions.\n\n> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra\n\n### The Three Pillars of Calm Engineering\n\n1. **Unified Schema Contracts**: Generating client SDKs directly from backend DSL definitions.\n2. **Fine-Grained Reactivity**: Updating only the DOM nodes that actually changed instead of diffing a virtual tree.\n3. **Row-Level Security at the Boundary**: Protecting every read and write where data lives.\n\nBy uniting SolidJS 2's reactive primitives with Cequre's native client SDK, developers gain end-to-end type safety without external package overhead.`,
        category: "Architecture" as const,
        readingTime: 4,
        published: true,
        coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
        author: authorId,
      },
      {
        title: "Fine-Grained Reactivity: SolidJS 2 and the Death of the Virtual DOM",
        slug: "fine-grained-reactivity-solidjs-2",
        summary:
          "An in-depth analysis of compiler-driven signals, lazy route execution, and how SolidJS achieves peak web performance without virtual DOM reconciliation.",
        content: `For over a decade, virtual DOM reconciliation was accepted as the default paradigm for reactive web user interfaces. While diffing tree trees in memory represented a quantum leap over manual jQuery manipulations, it introduced inherent performance ceilings and memory overhead.\n\n## The Direct DOM Paradigm\n\nSolidJS challenged this foundation by asking: What if components only executed once during initialization?\n\n\`\`\`tsx\n// In SolidJS, this component function runs once\nfunction Counter() {\n  const [count, setCount] = createSignal(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count()}</button>;\n}\n\`\`\`\n\nWhen \`count\` increments, Solid does not rebuild or diff a virtual tree. Instead, the signal directly notifies the exact text node within the browser DOM. This surgical precision results in sub-millisecond execution times and minimal memory pressure.\n\n### SolidJS 2 Enhancements\n\nSolid 2 further refines these primitives with unified suspense scheduling, streamlined start architecture, and native server functions, making it the most refined reactive framework available today.`,
        category: "Technology" as const,
        readingTime: 3,
        published: true,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
        author: authorId,
      },
      {
        title: "Crafting Timeless Digital Typography in Modern Web Design",
        slug: "crafting-timeless-digital-typography",
        summary:
          "Moving beyond generic fonts: pairing serif headlines with high-contrast geometric sans to evoke editorial gravitas and enduring legibility.",
        content: `Typography is the architecture of thought on the web. In an era saturated with generic sans-serif landing pages, thoughtful editorial publications require distinct typographical voices that convey authority and intellectual depth.\n\n## The Editorial Pairing Philosophy\n\nPairing high-contrast optical serifs (such as Newsreader) with utilitarian, humanist geometric sans-serifs (such as Plus Jakarta Sans) establishes an immediate hierarchy:\n\n* **Headlines**: Command contemplation and slower, deliberate reading.\n* **Body Text**: Optimizes reading rhythm and reduces eye fatigue across thousands of words.\n* **Monospace Metadata**: Accents technical veracity with precision timestamps and category badges.\n\nGood design is not decorative; it is the physical manifestation of care.`,
        category: "Design" as const,
        readingTime: 3,
        published: true,
        coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
        author: authorId,
      },
    ];

    for (const post of samplePosts) {
      await serverClient.posts.post(post);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error seeding articles on server:", err);
    return { success: false, error: err?.message };
  }
}
