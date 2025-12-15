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
  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
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
        throw new Error("Authentication is not available. Database has been removed.");
      },
    }),
  ],

  callbacks: {
    jwt: async (payload: any) => {
      const { token, user } = payload;

      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        };
      }
      return token;
    },

    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        return session;
      }
      return session;
    },
  },
};
