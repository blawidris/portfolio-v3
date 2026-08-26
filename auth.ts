import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { verifyAdminCredentials } from "@/lib/auth/credentials"
import { getServerEnvironment } from "@/lib/env"

const environment = getServerEnvironment()

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const admin = await verifyAdminCredentials(credentials.email, credentials.password)
        if (!admin) return null
        return { id: admin.id, name: admin.name, email: admin.email }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  secret: environment.AUTH_SECRET,
})
