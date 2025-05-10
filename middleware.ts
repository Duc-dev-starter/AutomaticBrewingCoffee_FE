import { NextRequest, NextResponse } from "next/server";
import { Path } from "./constants/path";

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|public|assets|healthz).*)",
    ],
};

const allowedPaths = [
    Path.DASHBOARD,
    Path.MANAGE_ORDERS,
    Path.MANAGE_RECIPES,
    Path.MANAGE_INGREDIENTS,
    Path.MANAGE_DEVICES,
    Path.MANAGE_KIOSKS,
    Path.MANAGE_COSTS,
    Path.MANAGE_PRODUCTS,
    Path.PROFILE,
    Path.REMINDER,
    Path.RECIPE,
    Path.HOME,
    Path.LOGIN,
    Path.NOT_FOUND,
    Path.MANAGE_WORKFLOWS,
    Path.MANAGE_LOCATION_TYPES,
    Path.MANAGE_ORGANIZATIONS,
    Path.MANAGE_STORES,
    Path.MANAGE_DEVICE_TYPES,
    Path.MANAGE_DEVICE_MODELS,
    Path.MANAGE_KIOSK_VERSIONS,
    Path.MANAGE_KIOSK_TYPES
];

const dynamicPathPrefixes = [
    Path.MANAGE_MENUS,
    Path.MANAGE_WORKFLOWS,
    Path.MANAGE_KIOSK_VERSIONS,
    Path.MANAGE_KIOSKS
];

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    const isPublicPath = pathname === Path.LOGIN || pathname === Path.HOME;

    if (!accessToken || !refreshToken) {
        if (!isPublicPath) {
            return NextResponse.redirect(new URL(Path.LOGIN, req.url));
        }
    }

    const isAllowed = allowedPaths.includes(pathname) || dynamicPathPrefixes.some(prefix => pathname.startsWith(prefix));

    if (!isAllowed) {
        return NextResponse.rewrite(new URL(Path.NOT_FOUND, req.url));
    }

    return NextResponse.next();
}
