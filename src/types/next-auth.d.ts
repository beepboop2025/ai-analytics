import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email: string
      image?: string | null
      role: string
      emailVerified?: Date | null
    }
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    emailVerified?: string | null
  }
}
