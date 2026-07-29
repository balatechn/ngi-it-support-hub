import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
    ...(process.env.NEXT_PUBLIC_DEMO_MODE === "true"
      ? [
          CredentialsProvider({
            id: "demo",
            name: "Demo Login",
            credentials: {
              role: { label: "Role", type: "text" },
            },
            async authorize(credentials) {
              const roles: Record<string, { id: string; name: string; email: string; role: string }> = {
                admin: { id: "u1", name: "Sarah Mitchell", email: "s.mitchell@contoso.com", role: "admin" },
                engineer: { id: "u2", name: "James Chen", email: "j.chen@contoso.com", role: "engineer" },
                manager: { id: "u5", name: "Emma Thompson", email: "e.thompson@contoso.com", role: "manager" },
                employee: { id: "u6", name: "David Park", email: "d.park@contoso.com", role: "employee" },
              };
              const user = roles[credentials?.role ?? "employee"];
              return user ?? null;
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.sub ?? "";
        (session.user as { id?: string; role?: string }).role = (token.role as string) ?? "employee";
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.role = "employee";
      }
      if (profile) {
        token.role = (profile as { jobTitle?: string }).jobTitle?.toLowerCase().includes("it")
          ? "engineer"
          : "employee";
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
