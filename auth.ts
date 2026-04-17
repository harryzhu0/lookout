import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import crypto from "crypto";

// Store for user UIDs (in production, use a database)
import fs from "fs/promises";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "users.json");

export interface AppUser {
  githubId: string;
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: number;
  currentWorkspace?: string;
}

async function getUsers(): Promise<Record<string, AppUser>> {
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveUsers(users: Record<string, AppUser>) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Runtime validation function
function validateEnvironmentVariables() {
  const githubId = process.env.GITHUB_ID;
  const githubSecret = process.env.GITHUB_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  if (!githubId || !githubSecret) {
    throw new Error(
      "Missing required environment variables: GITHUB_ID and GITHUB_SECRET must be set",
    );
  }

  if (!nextAuthSecret) {
    throw new Error(
      "Missing required environment variable: NEXTAUTH_SECRET must be set",
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      validateEnvironmentVariables();

      if (account && profile) {
        const users = await getUsers();
        const githubId =
          profile.id?.toString() || profile.sub || account.providerAccountId;

        let user = Object.values(users).find((u) => u.githubId === githubId);

        if (!user) {
          // First time user - generate permanent UID
          const uid = crypto.randomBytes(16).toString("hex");
          user = {
            githubId: githubId,
            uid: uid,
            name: profile.name || profile.login || "User",
            email: profile.email || "",
            avatar: profile.avatar_url,
            createdAt: Date.now(),
          };
          users[uid] = user;
          await saveUsers(users);
        }

        token.uid = user.uid;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.avatar as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});
