import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Google,
    GitHub,
    Credentials({
      // We'll leave authorize empty here as it's handled in auth.ts with DB
      authorize: async () => null
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.handle = token.handle;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.onboardingComplete = token.onboardingComplete;
        // @ts-ignore
        session.user.image = token.image;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

