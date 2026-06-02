import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectForUser, readSessionToken, SESSION_COOKIE } from "@/lib/session";

const publicRoutes = ["/login", "/login/verify"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = publicRoutes.includes(pathname);
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!session && !isPublic) {
    return redirect(request, "/login");
  }

  if (!session) {
    return NextResponse.next();
  }

  if (session.user.onboarding_completed && (isPublic || isOnboarding)) {
    return redirect(request, "/");
  }

  if (!session.user.onboarding_completed && !isPublic && !isOnboarding) {
    return redirect(request, getSafeRedirectForUser(session.user));
  }

  return NextResponse.next();
}

function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|.*\\..*).*)"]
};
