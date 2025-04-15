import { QwikAuth$ } from "@auth/qwik";
import GitHub from "@auth/qwik/providers/github";

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  () => ({
    providers: [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET_SECRET!,
        authorization: {
          params: {
            scope: "repo user:email",
          },
        },
      }),
    ],
    secret: process.env.AUTH_SECRET!,
    callbacks: {
      async jwt({ token, account }) {
        // Persist the OAuth access_token to the token
        if (account) {
          token.accessToken = account.access_token;
        }
        return token;
      },
      async session({ session, token }) {
        // Send access token to the client
        (session as any).accessToken = token.accessToken;
        return session;
      },
    },
  }),
);
