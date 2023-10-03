import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    Google({
      clientId: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      httpOptions: {
        timeout: 300,
      },
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure:
          !process.env.NEXT_PUBLIC_MODE ||
          process.env.NEXT_PUBLIC_MODE === 'production',
      },
    },
  },
  pages: { signIn: '/login' },
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.role = 'student'
      }
      return token
    },
  },
}

export default NextAuth(authOptions)
