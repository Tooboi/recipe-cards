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

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
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
    async jwt({ token, user, trigger, session, account, profile }) {
      // Runs on sign-in
      if (account) {
        token.accessToken = account.access_token;
      }

      if (user) {
        if (account && account.provider !== "credentials") {
          // Google / GitHub: Auth.js hands us a random UUID here because there is
          // no database adapter. Link the login to a real user record instead.
          const dbUser = await findOrCreateOAuthUser({
            email: user.email,
            name: user.name ?? profile?.name ?? profile?.login,
            image: user.image,
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.username;
            token.email = dbUser.email;
          }
        } else {
          token.id = user.id; // persist DB user ID
        }
      }

      // Older sessions may still carry a UUID; repair them from the email.
      if (token.id && !isObjectId(token.id) && token.email) {
        const dbUser = await prisma.user
          .findUnique({ where: { email: String(token.email).toLowerCase() }, select: { id: true } })
          .catch(() => null);
        token.id = dbUser?.id ?? undefined;
      }

      //  Handle update() calls from client
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
      if (session.user && token.id && isObjectId(token.id)) {
        // Always fetch fresh data from DB. Never let a lookup failure break
        // every page: fall back to what's in the token.
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: String(token.id) },
            select: { id: true, username: true, email: true, image: true },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.name = dbUser.username;
            session.user.email = dbUser.email;
            session.user.image = dbUser.image || "";
          }
        } catch (err) {
          console.error("[auth] session lookup failed", err);
        }
      }

      // Handle client-side update() call
      if (trigger === "update" && newSession) {
        if (newSession.name) {
          session.user.name = newSession.name;
        }
        if (newSession.email) {
          session.user.email = newSession.email;
        }
        if (newSession.image) {
          session.user.image = newSession.image;
        }
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

function isObjectId(value) {
  return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);
}

/** Finds the user for an OAuth email, creating one (with a unique username) if needed. */
async function findOrCreateOAuthUser({ email, name, image }) {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) return existing;

  const base =
    (name || normalized.split("@")[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "")
      .slice(0, 20) || "cook";

  for (let attempt = 0; attempt < 5; attempt++) {
    const username = attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      return await prisma.user.create({
        data: {
          email: normalized,
          username,
          emailVerified: new Date(),
          // Provider avatars are full URLs; the app expects Cloudinary ids, so skip them.
          image: image && !/^https?:/.test(image) ? image : null,
        },
      });
    } catch (err) {
      // P2002 = unique constraint (username taken) → try another suffix.
      if (err?.code !== "P2002") throw err;
      const byEmail = await prisma.user.findUnique({ where: { email: normalized } });
      if (byEmail) return byEmail;
    }
  }
  return null;
}
