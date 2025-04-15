import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|public|assets|healthz).*)",
    ],
};

export function middleware(req: NextRequest) {
    // if (!["/", "/about", "/contact"].includes(req.nextUrl.pathname)) {
    //   return NextResponse.rewrite(new URL("/not-found", req.url));
    // }
    console.log(req.nextUrl.pathname)

    return NextResponse.next();
}