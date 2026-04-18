import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Helper to save user data
async function saveUserToStorage(user: any) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const usersFile = path.join(DATA_DIR, "users.json");

    let users = {};
    try {
      const data = await fs.readFile(usersFile, "utf-8");
      users = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }

    if (!users[user.uid]) {
      users[user.uid] = user;
      await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
    }
  } catch (error) {
    console.error("Error saving user:", error);
  }
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
        // Generate a permanent UID for the user
        const uid = crypto.randomBytes(16).toString("hex");
        token.uid = uid;
        token.name = profile.name || profile.login || "User";
        token.email = profile.email || "";
        token.avatar = profile.avatar_url;

        // Save user to storage
        await saveUserToStorage({
          uid: uid,
          name: token.name,
          email: token.email,
          avatar: token.avatar,
          githubId: profile.id,
          createdAt: Date.now(),
        });
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
