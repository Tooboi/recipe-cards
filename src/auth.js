import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
// import { User } from "@/model/user-model";
import bcrypt from "bcryptjs";
// import { getUserByEmail } from "@/app/actions";
import prisma from "@/lib/prisma";

// import type {
//   GetServerSidePropsContext,
//   NextApiRequest,
//   NextApiResponse,
// } from "next"
// import type { NextAuthOptions } from "next-auth"

// import { getServerSession } from "next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username ?? undefined,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Runs on sign-in
      if (user) {
        token.id = user.id; // persist DB user ID
      }

      // 🔥 Handle update() calls from client
      if (trigger === "update" && session) {
        // Only update fields you allow from the client!
        if (session.name) {
          token.name = session.name;
        }
        if (session.email) {
          token.email = session.email;
        }
      }

      return token;
    },

    async session({ session, token, trigger, newSession }) {
      if (session.user && token.id) {
        // Always fetch fresh data from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { id: true, username: true, email: true },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.username;
          session.user.email = dbUser.email;
        }
      }

      // Handle client-side update() call
      if (trigger === "update" && newSession) {
        if (newSession.name) {
          session.user.name = newSession.name;
          router.refresh();
        }
        if (newSession.email) {
          session.user.email = newSession.email;
        }
      }

      return session;
    },
  },
});

// // You'll need to import and pass this
// // to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
// export const config = {
//   providers: [], // rest of your config
// } satisfies NextAuthOptions

// // Use it in server contexts
// export function auth(
//   ...args:
//     | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
//     | [NextApiRequest, NextApiResponse]
//     | []
// ) {
//   return getServerSession(...args, config)
// }
