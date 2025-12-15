import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// NOTE: Prisma has been removed. This auth configuration will not work without a database adapter.
// Consider using Medusa's built-in authentication instead.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  // adapter: PrismaAdapter(prisma) as Adapter, // REMOVED: Prisma no longer available
  secret: process.env.SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Jhondoe" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
      },

      async authorize(credentials) {
        // NOTE: Database functionality removed. This will always fail.
        // Migrate to Medusa auth or implement your own user management.
        // Return null instead of throwing to prevent 500 errors
        return null;
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    session: async ({ session, token }) => {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
