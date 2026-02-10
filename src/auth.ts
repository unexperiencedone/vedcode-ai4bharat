
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        const existingUser = await db.query.profiles.findFirst({
          where: eq(profiles.email, user.email),
        });

        if (existingUser) {
          // Update existing user with latest auth info
          await db
            .update(profiles)
            .set({
              image: user.image,
              authId: account?.providerAccountId,
            })
            .where(eq(profiles.email, user.email));
          return true;
        }

        // Create new user
        const handle = user.name?.toLowerCase().replace(/\s+/g, "") || user.email.split("@")[0];
        
        await db.insert(profiles).values({
          email: user.email,
          name: user.name || "Anonymous",
          image: user.image,
          authId: account?.providerAccountId,
          handle: handle + Math.floor(Math.random() * 1000), // Ensure uniqueness roughly
          role: "Explorer",
        });

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async session({ session }) {
        // Attach profile data to session
        if (session.user?.email) {
            const profile = await db.query.profiles.findFirst({
                where: eq(profiles.email, session.user.email)
            });
            if (profile) {
                // @ts-ignore
                session.user.handle = profile.handle;
                // @ts-ignore
                session.user.role = profile.role;
            }
        }
        return session;
    }
  },
});
