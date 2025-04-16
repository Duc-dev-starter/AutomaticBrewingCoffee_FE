import { NextRequest, NextResponse } from "next/server";
import { Path } from "./constants/path";

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|public|assets|healthz).*)",
    ],
};

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (!Object.values(Path).includes(pathname)) {
        return NextResponse.rewrite(new URL(Path.NOT_FOUND, req.url));
    }

    return NextResponse.next();
}
