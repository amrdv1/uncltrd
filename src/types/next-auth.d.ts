import NextAuth, { type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
  role: string
  id: string
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}
