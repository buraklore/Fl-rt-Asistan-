import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase session refresh middleware.
 *
 * Supabase access tokens expire hourly. Without this middleware, Server
 * Components would see stale sessions and RLS would reject requests.
 * This runs before every route and swaps in a fresh access token.
 *
 * It also guards (app) routes — unauthenticated users get bounced to /sign-in.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Gate the authenticated app routes
  const isAppRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/generate") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/targets") ||
    pathname.startsWith("/insights") ||
    pathname.startsWith("/settings");

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute =
    pathname === "/sign-in" || pathname === "/sign-up";
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/generate";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on every path except static assets and image optimization
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
