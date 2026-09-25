import type { CequreModule } from "cequre-ts";
import type { Collections } from "../_generated/server";
import * as oidc from "openid-client";

let oidcConfigPromise: Promise<oidc.Configuration> | null = null;

function getGoogleOidcConfig(): Promise<oidc.Configuration> {
  if (!oidcConfigPromise) {
    const serverUrl = new URL("https://accounts.google.com");
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    oidcConfigPromise = oidc.discovery(serverUrl, clientId, clientSecret);
  }
  return oidcConfigPromise;
}

const SERVER_AUTH_URL = process.env.SERVER_AUTH_URL || "http://localhost:3000";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const GOOGLE_REDIRECT_URI = `${SERVER_AUTH_URL}/api/auth/google/callback`;

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey) {
      cookies[rawKey] = decodeURIComponent(rest.join("="));
    }
  }
  return cookies;
}

export function registerAuthRoutes(module: CequreModule<Collections>) {
  // 1. Initiate Google OAuth authorization flow with PKCE & state protection
  module.get("/auth/google", async (ctx) => {
    try {
      const config = await getGoogleOidcConfig();
      const code_verifier = oidc.randomPKCECodeVerifier();
      const code_challenge = await oidc.calculatePKCECodeChallenge(code_verifier);
      const state = oidc.randomState();

      const targetRedirect = ctx.url.searchParams.get("redirect") || "/dashboard";
      const safeRedirect = targetRedirect.startsWith("/") ? targetRedirect : "/dashboard";

      const authorizationUrl = oidc.buildAuthorizationUrl(config, {
        redirect_uri: GOOGLE_REDIRECT_URI,
        scope: "openid email profile",
        code_challenge,
        code_challenge_method: "S256",
        state,
        prompt: "select_account",
      });

      // Store state, PKCE verifier, and post-auth redirect target in temporary cookies
      ctx.responseHeaders.append(
        "Set-Cookie",
        `oauth_verifier=${code_verifier}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      );
      ctx.responseHeaders.append("Set-Cookie", `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
      ctx.responseHeaders.append(
        "Set-Cookie",
        `oauth_redirect=${encodeURIComponent(safeRedirect)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      );

      return new Response(null, {
        status: 302,
        headers: { Location: authorizationUrl.href },
      });
    } catch (error: any) {
      console.error("Failed to initiate Google OAuth:", error);
      return ctx.redirect(
        `${CLIENT_URL}/login?error=${encodeURIComponent(error.message || "Failed to initiate Google authentication")}`,
      );
    }
  });

  // 2. Google OAuth callback endpoint
  module.get("/auth/google/callback", async (ctx) => {
    const cookieHeader = ctx.request.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);

    const oauthState = cookies["oauth_state"];
    const oauthVerifier = cookies["oauth_verifier"];
    const oauthRedirect = cookies["oauth_redirect"] || "/dashboard";
    const finalRedirectPath = oauthRedirect.startsWith("/") ? oauthRedirect : "/dashboard";

    // Invalidate temporary OAuth cookies immediately
    ctx.responseHeaders.append("Set-Cookie", "oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    ctx.responseHeaders.append("Set-Cookie", "oauth_verifier=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    ctx.responseHeaders.append("Set-Cookie", "oauth_redirect=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");

    const queryError = ctx.url.searchParams.get("error");
    if (queryError) {
      const desc = ctx.url.searchParams.get("error_description") || queryError;
      return new Response(null, {
        status: 302,
        headers: { Location: `${CLIENT_URL}/login?error=${encodeURIComponent(desc)}` },
      });
    }

    const state = ctx.url.searchParams.get("state");
    if (!state || !oauthState || state !== oauthState) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${CLIENT_URL}/login?error=${encodeURIComponent("Authentication failed: state parameter mismatch or session expired.")}`,
        },
      });
    }

    if (!oauthVerifier) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${CLIENT_URL}/login?error=${encodeURIComponent("Authentication failed: missing PKCE code verifier cookie.")}`,
        },
      });
    }

    try {
      const config = await getGoogleOidcConfig();
      const tokenSet = await oidc.authorizationCodeGrant(config, ctx.url, {
        pkceCodeVerifier: oauthVerifier,
        expectedState: oauthState,
      });

      const claims = tokenSet.claims();
      if (!claims || !claims.email) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${CLIENT_URL}/login?error=${encodeURIComponent("Google account did not provide a verified email address.")}`,
          },
        });
      }

      const googleId = claims.sub;
      const rawEmail = typeof claims.email === "string" ? claims.email : String(claims.email);
      const email = rawEmail.toLowerCase().trim();
      const name = (typeof claims.name === "string" ? claims.name : "") || email.split("@")[0];
      const avatar = typeof claims.picture === "string" ? claims.picture : undefined;

      // Look up existing user by googleId or email
      let user = await ctx.cequre.findOne("users", {
        where: { googleId: { eq: googleId } } as any,
      });

      if (!user) {
        user = await ctx.cequre.findOne("users", {
          where: { email: { eq: email } } as any,
        });

        if (user) {
          // Link googleId to existing user, updating avatar if missing
          user = await ctx.cequre.update("users", user.id, {
            googleId,
            ...(avatar && !user.avatar ? { avatar } : {}),
          });
        } else {
          // Create new user with random strong password
          const randomPassword = crypto.randomUUID() + "-" + crypto.randomUUID();
          user = await ctx.cequre.create("users", {
            name,
            email,
            password: randomPassword,
            googleId,
            avatar,
            role: "user",
          } as any);
        }
      } else if (avatar && !user.avatar) {
        user = await ctx.cequre.update("users", user.id, { avatar });
      }

      if (!user) {
        throw new Error("Failed to create or link user account");
      }

      if (!ctx.cequre.authEngine) {
        throw new Error("Authentication engine is not initialized");
      }

      const tokens = await ctx.cequre.authEngine.generateTokenPair(user as unknown as Record<string, unknown>, "users");

      // 7-day persistent session cookies
      const maxAge = 60 * 60 * 24 * 7;
      ctx.responseHeaders.append(
        "Set-Cookie",
        `cequre_access_token=${tokens.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
      );
      ctx.responseHeaders.append(
        "Set-Cookie",
        `cequre_auth=${tokens.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
      );
      if (tokens.refreshToken) {
        ctx.responseHeaders.append(
          "Set-Cookie",
          `cequre_auth_refresh=${tokens.refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
        );
      }

      return new Response(null, {
        status: 302,
        headers: { Location: `${CLIENT_URL}${finalRedirectPath}` },
      });
    } catch (error: any) {
      console.error("Google OAuth callback error:", error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${CLIENT_URL}/login?error=${encodeURIComponent(error.message || "Failed to complete Google authentication")}`,
        },
      });
    }
  });
}
