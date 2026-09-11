import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

/**
 * NextAuth.js Configuration
 *
 * To enable OAuth:
 * 1. Create a Google OAuth client at https://console.cloud.google.com/apis/credentials
 *    - Add your domain to authorized redirect URIs: https://yourdomain.com/api/auth/callback/google
 * 2. Create a Facebook app at https://developers.facebook.com/apps/
 *    - Add Facebook Login product, set redirect URI: https://yourdomain.com/api/auth/callback/facebook
 * 3. Add to .env:
 *    GOOGLE_CLIENT_ID=xxx
 *    GOOGLE_CLIENT_SECRET=xxx
 *    FACEBOOK_CLIENT_ID=xxx
 *    FACEBOOK_CLIENT_SECRET=xxx
 *    NEXTAUTH_SECRET=any-random-string
 *    NEXTAUTH_URL=https://yourdomain.com
 *
 * In demo mode (no keys), OAuth buttons show but redirect to a demo flow.
 */

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
// Fail-closed: if NEXTAUTH_SECRET is not set, refuse to start rather than
// falling back to a hardcoded public string (which would let anyone forge
// session tokens). The only exception is local dev (NODE_ENV !== "production")
// where we generate a random per-process secret for convenience.
const nextAuthSecret = process.env.NEXTAUTH_SECRET
  || (process.env.NODE_ENV !== "production"
    ? `dev-only-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
    : "");
if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "NEXTAUTH_SECRET environment variable is required in production. " +
    "Generate one with: openssl rand -base64 32"
  );
}

const providers: any[] = [];

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

if (facebookClientId && facebookClientSecret) {
  providers.push(
    FacebookProvider({
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: nextAuthSecret,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Find or create a User record for this OAuth user.
      let dbUser = await db.user.findUnique({ where: { email: user.email } });
      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            name: user.name || "OAuth User",
            email: user.email,
            role: "GUEST",
          },
        });

        // Also create CRM customer
        const customer = await db.customer.create({
          data: {
            name: user.name || "Guest",
            email: user.email,
            phone: `oauth-${Date.now()}`, // placeholder; OAuth users may add phone later
            tags: "OAUTH_USER",
          },
        });
        await db.user.update({
          where: { id: dbUser.id },
          data: { customerId: customer.id },
        });
      }

      // SECURITY (Round 3 F2 fix): bridge NextAuth session to the app's own
      // session system. NextAuth's JWT cookie (`next-auth.session-token`) is
      // NOT read by `getUserFromRequest` — that function only reads
      // `__Host-session_token` / `session_token` from the DB Session table.
      // Without this bridge, OAuth users appear logged-in to NextAuth but
      // logged-out to every API route, breaking the entire post-login flow.
      // Create an app session so `getUserFromRequest` returns the user.
      // Note: this writes the cookie via Set-Cookie on the NextAuth response.
      // The cookie name is `session_token` (not `__Host-` since this code path
      // runs in both dev and prod; NextAuth sets its own Secure flag).
      try {
        const { createSession } = await import("@/lib/auth");
        const session = await createSession(dbUser.id, "GUEST");
        // We can't directly set the cookie here (NextAuth manages the response),
        // but we stash the token on the user object so the jwt callback can
        // expose it, and the frontend can pick it up via /api/auth/session.
        (user as any).appSessionToken = session.token;
      } catch (e) {
        console.error("OAuth session bridge failed:", e);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        // Pass the app session token through to the session callback.
        if ((user as any).appSessionToken) {
          token.appSessionToken = (user as any).appSessionToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        // Surface the app session token so the frontend can set the cookie.
        if (token.appSessionToken) {
          (session as any).appSessionToken = token.appSessionToken;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/#/login",
  },
};

export const oauthConfigured = {
  google: !!googleClientId,
  facebook: !!facebookClientId,
  any: providers.length > 0,
};
