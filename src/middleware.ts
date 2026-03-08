import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPublicRoute = ["/", "/login", "/register", "/manifesto", "/changelog"].includes(nextUrl.pathname);
    const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return;
    }

    if (isLoggedIn) {
        // @ts-ignore
        const onboardingComplete = req.auth?.user?.onboardingComplete;
        console.log(`[Middleware] Path: ${nextUrl.pathname}, OnboardingComplete: ${onboardingComplete}`);


        if (!onboardingComplete && nextUrl.pathname !== "/onboarding") {
            return Response.redirect(new URL("/onboarding", nextUrl));
        }
    }


    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return;
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
    }

    return;

});

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
