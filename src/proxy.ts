
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProfilePath =
    pathname === "/profile" ||
    pathname.startsWith("/profile/");

  const isLoginOrSignup =
    pathname === "/login" ||
    pathname === "/signup";

  const isHome = pathname === "/";

  const isLogoutApi = pathname === "/api/users/logout";

  let isAuthenticated = false;

  if (request.cookies.has("token")) {
    try {
      await getDataFromToken(request);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect from home page
  if (isHome) {
    return NextResponse.redirect(
      new URL(
        isAuthenticated ? "/profile" : "/signup",
        request.url
      )
    );
  }

  // Protect profile pages
  if (isProfilePath && !isAuthenticated) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Protect logout API
  if (isLogoutApi && !isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Redirect logged-in users away from login/signup
  if (isLoginOrSignup && isAuthenticated) {
    return NextResponse.redirect(
      new URL("/profile", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/login",
    "/signup",
    "/api/users/logout",
  ],
};
