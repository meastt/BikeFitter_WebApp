import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      // On first sign in, add the user's ID to the token
      if (account && profile) {
        token.id = profile.sub // Google's user ID (sub claim)
      }
      return token
    },
    async session({ session, token }) {
      // Add the user ID from the token to the session
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
