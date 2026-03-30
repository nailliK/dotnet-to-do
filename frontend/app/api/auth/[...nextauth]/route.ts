import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.API_URL;

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const url = `${API_URL}/api/auth/login`;
        console.log('[NextAuth] authorize hitting:', url);

        let res;
        try {
          res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userName: credentials.username,
              password: credentials.password,
            }),
          });
        } catch (err) {
          console.error('[NextAuth] fetch failed:', err);
          return null;
        }

        if (!res.ok) {
          console.error('[NextAuth] API returned:', res.status, await res.text().catch(() => ''));
          return null;
        }

        let data;
        try {
          data = await res.json();
        } catch {
          return null;
        }

        return {
          id: data.userId,
          name: data.userName,
          accessToken: data.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.accessToken || !token.userId) {
        throw new Error('Session is missing required auth fields');
      }
      session.accessToken = token.accessToken;
      session.userId = token.userId;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
