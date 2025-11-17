import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

const providers = [];

// Only add Google provider if environment variables are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Only add hardcoded credentials provider in development mode (NOT production)
if (process.env.NODE_ENV === "development") {
  providers.push(
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // DANGER: Hardcoded credentials - ONLY for development/testing
        // SECURITY WARNING: This should NEVER be used in production!
        if (credentials?.email === "admin@ooplab.org" && credentials?.password === "admin123") {
          return {
            id: "1",
            email: "admin@ooplab.org",
            name: "Admin User",
            role: "admin"
          }
        }
        return null
      }
    })
  );
}

// Validate NEXTAUTH_SECRET for production (allow build without throwing)
const nextAuthSecret = process.env.NEXTAUTH_SECRET || "fallback-secret-for-development";

const handler = NextAuth({
  providers,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: nextAuthSecret,
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }