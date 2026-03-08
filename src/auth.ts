import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
    ...authConfig.callbacks,
    async signIn({ user, account }) {
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
      // Call the base config jwt for mapping/updates
      // @ts-ignore
      let updatedToken = await authConfig.callbacks.jwt({ token, user, trigger, session });

      if (user) {
        const profile = await db.query.profiles.findFirst({
          where: eq(profiles.email, user.email as string),
        });
        if (profile) {
          updatedToken.id = profile.id;
          updatedToken.handle = profile.handle;
          updatedToken.role = profile.role;
          updatedToken.onboardingComplete = profile.onboardingComplete;
          updatedToken.image = profile.image;
        } else {
          updatedToken.id = user.id;
        }
      }

      return updatedToken;
    },
    // The 'session' callback is already spread from authConfig and handles mapping token -> session
  },
});
