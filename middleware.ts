import { NextRequest, NextResponse } from "next/server";
import { Path } from "./constants/path.constant";
import { jwtDecode } from "jwt-decode";

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

const ADMIN_ONLY_PATHS = [
    Path.MANAGE_CATEGORIES,
    Path.MANAGE_ACCOUNTS,
    Path.MANAGE_ORGANIZATIONS,
    Path.MANAGE_PRODUCTS,
    Path.MANAGE_WORKFLOWS,
    Path.UPDATE_WORKFLOW,
    Path.CREATE_WORKFLOW,
    Path.MANAGE_LOCATION_TYPES,
    Path.MANAGE_DEVICE_TYPES,
    Path.MANAGE_DEVICE_MODELS,
    Path.MANAGE_SYNC_EVENT,
    Path.MANAGE_SYNC_TASKS,
    Path.MANAGE_INGREDIENT_TYPE,
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

    let roleName: string | undefined;


    try {
        // Giả sử accessToken là JWT, có trường "roleName"
        const decoded = jwtDecode(accessToken) as { roleName?: string };
        roleName = decoded?.roleName;
    } catch (e) {
        // Nếu decode lỗi, có thể redirect về login hoặc invalid-request
        url.pathname = Path.LOGIN;
        return NextResponse.redirect(url);
    }

    // Nếu truy cập path dành cho admin, kiểm tra role
    if (
        ADMIN_ONLY_PATHS.some((adminPath) => pathname.startsWith(adminPath)) &&
        roleName !== "Admin"
    ) {
        url.pathname = Path.INVALID_REQUEST;
        return NextResponse.redirect(url);
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