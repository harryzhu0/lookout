import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// Validate required environment variables
const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!githubId || !githubSecret) {
  throw new Error("Missing required environment variables: GITHUB_ID and GITHUB_SECRET must be set");
}

if (!nextAuthSecret) {
  throw new Error("Missing required environment variable: NEXTAUTH_SECRET must be set");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: githubId,
      clientSecret: githubSecret,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  secret: nextAuthSecret,
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects only go to same origin
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
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
});
