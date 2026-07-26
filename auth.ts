import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const adminAllowlist = (process.env.ADMIN_GITHUB_ALLOWLIST ?? "")
  .split(",")
  .map((username) => username.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: "/admin/sign-in",
  },
  callbacks: {
    async signIn({ profile }) {
      const login = (profile as { login?: string } | undefined)?.login?.toLowerCase();
      return Boolean(login && adminAllowlist.includes(login));
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.login = token.login as string | undefined;
      }
      return session;
    },
  },
});
