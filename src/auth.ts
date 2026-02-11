
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    GitHub,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db.query.profiles.findFirst({
          where: eq(profiles.email, email),
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // For credentials, user is already validated in authorize()
      if (account?.provider === "credentials") return true;

      if (!user.email) return false;

      try {
        const existingUser = await db.query.profiles.findFirst({
          where: eq(profiles.email, user.email),
        });

        if (existingUser) {
          await db
            .update(profiles)
            .set({
              image: user.image,
              authId: account?.providerAccountId,
            })
            .where(eq(profiles.email, user.email));
          return true;
        }

        const handle = user.name?.toLowerCase().replace(/\s+/g, "") || user.email.split("@")[0];

        await db.insert(profiles).values({
          email: user.email,
          name: user.name || "Anonymous",
          image: user.image,
          authId: account?.providerAccountId,
          handle: handle + Math.floor(Math.random() * 1000),
          role: "Explorer",
        });

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // First sign-in only: fetch full profile from DB
        // Cannot query DB on every refresh — Edge Runtime incompatible with postgres.js
        const profile = await db.query.profiles.findFirst({
          where: eq(profiles.email, user.email as string),
        });
        if (profile) {
          token.handle = profile.handle;
          token.role = profile.role;
          token.onboardingComplete = profile.onboardingComplete;
          token.image = profile.image;
        }
      }

      if (trigger === "update" && session) {
        token.onboardingComplete = session.onboardingComplete;
        if (session.handle) token.handle = session.handle;
        if (session.role) token.role = session.role;
        if (session.image) token.image = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
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
});
