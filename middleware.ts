import { NextRequest, NextResponse } from "next/server";
import { Path } from "./constants/path.constant";

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|public|assets|healthz).*)",
    ],
};

const allowedPaths = Object.values(Path);

const dynamicPathPrefixes = [
    Path.MANAGE_MENUS,
    Path.MANAGE_WORKFLOWS,
    Path.MANAGE_KIOSK_VERSIONS,
    Path.MANAGE_KIOSKS,
    Path.UPDATE_WORKFLOW,
    Path.MANAGE_NOTIFICATIONS
];

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const url = req.nextUrl.clone();

    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    const isPublicPath = pathname === Path.LOGIN || pathname === Path.HOME;

    if (!accessToken) {
        if (!isPublicPath) {
            url.pathname = Path.LOGIN;
            url.searchParams.set("redirect", pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // if (!accessToken || !refreshToken) {
    //     if (!isPublicPath) {
    //         url.pathname = Path.LOGIN;
    //         url.searchParams.set("redirect", pathname);
    //         return NextResponse.redirect(url);
    //     }
    //     return NextResponse.next();
    // }

    // if (accessToken && refreshToken && pathname === Path.LOGIN) {
    //     url.pathname = Path.INVALID_REQUEST;
    //     return NextResponse.redirect(url);
    // }

    if (accessToken && pathname === Path.LOGIN) {
        url.pathname = Path.INVALID_REQUEST;
        return NextResponse.redirect(url);
    }

    const isAllowed =
        allowedPaths.includes(pathname) ||
        dynamicPathPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (!isAllowed) {
        url.pathname = Path.NOT_FOUND;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}