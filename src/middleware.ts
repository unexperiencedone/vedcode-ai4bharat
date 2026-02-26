import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Public routes — accessible without login
  const publicRoutes = ["/", "/login", "/register", "/manifesto", "/changelog"]
  const isPublic = publicRoutes.includes(pathname)

  // If not authenticated and trying to access a protected route, redirect to login
  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to visit login/register, redirect appropriately
  if (req.auth && (pathname === "/login" || pathname === "/register")) {
    // @ts-ignore
    const onboardingComplete = req.auth.user?.onboardingComplete
    if (!onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If authenticated but onboarding not complete, redirect to onboarding
  // (except when already on onboarding or API routes)
  if (req.auth && !isPublic && pathname !== "/onboarding") {
    // @ts-ignore
    const onboardingComplete = req.auth.user?.onboardingComplete
    if (!onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }
  }

  // If onboarding complete and trying to visit onboarding, redirect to dashboard
  if (req.auth && pathname === "/onboarding") {
    // @ts-ignore
    const onboardingComplete = req.auth.user?.onboardingComplete
    if (onboardingComplete) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

