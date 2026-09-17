import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        const userId = user.id || `usr_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
        db.upsertUser({
          id: userId,
          name: user.name ?? null,
          email: normalizedEmail,
          image: user.image ?? null,
        });
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const normalizedEmail = (user.email || "").toLowerCase().trim();
        const dbUser = normalizedEmail ? db.getUserByEmail(normalizedEmail) : null;
        token.id = dbUser?.id || user.id || `usr_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
        token.name = user.name || dbUser?.name;
        token.email = normalizedEmail;
        token.picture = user.image || dbUser?.image;
      }
      if (trigger === "update" && session?.name && token.id) {
        token.name = session.name;
        db.updateUserName(token.id as string, session.name);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
