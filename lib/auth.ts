import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'admin@example.com'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check superadmin credentials first
        const superadminEmail = process.env.SUPERADMIN_EMAIL;
        const superadminPassword = process.env.SUPERADMIN_PASSWORD;

        if (credentials.email === superadminEmail && credentials.password === superadminPassword) {
          return {
            id: '0',
            email: superadminEmail,
            name: 'Super Admin',
            role: 'superadmin'
          };
        }

        // Check admin credentials
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          return {
            id: '1',
            email: adminEmail,
            name: 'Admin',
            role: 'admin'
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
