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
const nextAuthSecret = process.env.NEXTAUTH_SECRET || "demo-secret-key-guruvayur-dham";

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

      // Find or create a User record for this OAuth user
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

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
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
