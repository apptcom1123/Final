import { env } from "@/lib/env";
import type { AuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GitHubProvider from "next-auth/providers/github";

export const authOptions:AuthOptions = {
    secret: env.NEXTAUTH_SECRET,
    providers: [GitHubProvider({
        clientId: env.AUTH_GITHUB_ID,
        clientSecret: env.AUTH_GITHUB_SECRET
    })],
    pages: {
        signIn: "/"
    }
}

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };