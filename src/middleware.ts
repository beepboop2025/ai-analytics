import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const publicRoutes = ["/", "/pricing", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"]
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isApiRoute = pathname.startsWith("/api")
  const isWebhook = pathname === "/api/stripe/webhook"

  // Allow webhook and API routes (they handle their own auth)
  if (isWebhook || isApiRoute) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  const isPublic = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)
  const isAdminRoute = pathname.startsWith("/admin")

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Allow public routes
  if (isPublic) return NextResponse.next()

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // Protect all other routes (app pages)
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|images|favicon.ico).*)"],
}
