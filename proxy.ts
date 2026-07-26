import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/admin/sign-in")) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const signInUrl = new URL("/admin/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
