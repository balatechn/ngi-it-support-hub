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
        params: { scope: "openid profile email offline_access User.Read Team.ReadBasic.All Channel.ReadBasic.All ChannelMessage.Read.All ChannelMessage.Send Group.Read.All DeviceManagementManagedDevices.Read.All Directory.Read.All" },
      },
    }),

    // Device code flow: frontend polls /api/auth/devicepoll, then calls signIn("device-code", { access_token })
    CredentialsProvider({
      id: "device-code",
      name: "Device Code",
      credentials: {
        access_token: { label: "Access Token", type: "text" },
        name:         { label: "Name",         type: "text" },
        email:        { label: "Email",        type: "text" },
        userId:       { label: "User ID",      type: "text" },
        jobTitle:     { label: "Job Title",    type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.access_token) return null;

        // Verify the token is valid by calling Graph /me
        const res = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: { Authorization: `Bearer ${credentials.access_token}` },
        });
        if (!res.ok) return null;

        const me = await res.json();
        return {
          id:          me.id,
          name:        me.displayName ?? credentials.name,
          email:       me.userPrincipalName ?? credentials.email,
          accessToken: credentials.access_token,
          jobTitle:    me.jobTitle ?? "",
          role:        "admin" as const,   // device-code is an elevated admin flow
        };
      },
    }),

    // Demo mode – no Azure credentials needed
    ...(process.env.NEXT_PUBLIC_DEMO_MODE === "true"
      ? [
          CredentialsProvider({
            id: "demo",
            name: "Demo Login",
            credentials: { role: { label: "Role", type: "text" } },
            async authorize(credentials) {
              const roles: Record<string, { id: string; name: string; email: string; role: string }> = {
                admin:    { id: "u1", name: "Sarah Mitchell",  email: "s.mitchell@contoso.com", role: "admin" },
                engineer: { id: "u2", name: "James Chen",      email: "j.chen@contoso.com",     role: "engineer" },
                manager:  { id: "u5", name: "Emma Thompson",   email: "e.thompson@contoso.com", role: "manager" },
                employee: { id: "u6", name: "David Park",      email: "d.park@contoso.com",     role: "employee" },
              };
              return roles[credentials?.role ?? "employee"] ?? null;
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // On sign-in, persist extras into the JWT
      if (account?.access_token) token.accessToken = account.access_token;
      if (user) {
        const u = user as { accessToken?: string; role?: string; jobTitle?: string };
        if (u.accessToken) token.accessToken = u.accessToken;
        if (u.role)        token.role        = u.role;
        if (u.jobTitle)    token.jobTitle    = u.jobTitle;
      }
      // Always grant admin to the known admin email, regardless of sign-in method
      const ADMIN_EMAILS = ["bala@nationalgroupindia.com"];
      if (token.email && ADMIN_EMAILS.includes(token.email as string)) {
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      const s = session as typeof session & { accessToken?: string };
      const u = session.user as { id?: string; role?: string };
      s.accessToken = token.accessToken as string | undefined;
      u.id          = token.sub ?? "";
      u.role        = (token.role as string | undefined) ?? "employee";
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
