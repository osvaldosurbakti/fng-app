// lib/auth.ts
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'cross-app-token',
      name: 'Cross App Token',
      credentials: {
        token: { label: 'Token', type: 'string' }
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.token) {
            console.log('No token provided');
            return null;
          }

          // Verify JWT token dari login app
          const decoded = jwt.verify(
            credentials.token as string, 
            process.env.CROSS_APP_JWT_SECRET!
          ) as any;

          console.log('Decoded token:', decoded);

          // Validasi audience dan issuer
          if (decoded.aud !== 'fng-app' || decoded.iss !== 'fng-login-app') {
            console.log('Invalid audience or issuer');
            return null;
          }

          // Return user object
          return {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
          };
        } catch (error) {
          console.error('Token verification failed:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/callback',
  },
  session: {
    strategy: 'jwt' as const, // Tambahkan 'as const' untuk type safety
    maxAge: 24 * 60 * 60, // 24 hours
  }
};

export default NextAuth(authOptions);
export { authOptions };