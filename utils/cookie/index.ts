import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie'
import { logout, refreshToken } from "@/services/auth.service";
import { Path } from "@/constants/path.constant";

interface JwtPayload {
    exp: number;
    aud: string;
    fullname: string;
    iat: number;
    iss: string;
    nbf: number;
    role: string;
    username: string;
    userid: string;
}

export const handleToken = (accessToken: string, refreshToken: string) => {
    const decodedAccessToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
    const decodedRefreshToken: JwtPayload = jwtDecode<JwtPayload>(refreshToken);

    const user = {
        fullname: decodedRefreshToken.fullname,
        role: decodedRefreshToken.role,
        userid: decodedRefreshToken.userid,
        unique_name: decodedRefreshToken
    }

    const expAccessToken = decodedAccessToken.exp;
    const expRefreshToken = decodedRefreshToken.exp;

    const expiresInMsAccessToken = expAccessToken * 1000 - Date.now();
    const expiresInMsRefreshToken = expRefreshToken * 1000 - Date.now();

    const expiresInDaysAccessToken = expiresInMsAccessToken / (1000 * 60 * 60 * 24);
    const expiresInDaysRefreshToken = expiresInMsRefreshToken / (1000 * 60 * 60 * 24);

    Cookies.set('accessToken', accessToken, { expires: expiresInDaysAccessToken, secure: true });
    Cookies.set('refreshToken', refreshToken, { expires: expiresInDaysRefreshToken, secure: true });
    Cookies.set('user', JSON.stringify(user), { expires: expiresInDaysRefreshToken, secure: true });

    // scheduleTokenRefresh();
}

export const getAccessTokenFromCookie = (): string | null => {
    const token = Cookies.get("accessToken");
    return token || null;
}

// export const scheduleTokenRefresh = () => {
//     const accessToken = Cookies.get("accessToken");
//     const refreshTokenValue = Cookies.get("refreshToken");

//     if (!accessToken || !refreshTokenValue) {
//         logout();
//         window.location.href = '/login';
//         alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
//         return;
//     }

//     try {
//         const decodedAccessToken = jwtDecode<JwtPayload>(accessToken);
//         const decodedRefreshToken = jwtDecode<JwtPayload>(refreshTokenValue);
//         const accessExp = decodedAccessToken.exp * 1000;
//         const refreshExp = decodedRefreshToken.exp * 1000;
//         const now = Date.now();

//         // Nếu refreshToken hết hạn, logout ngay
//         if (refreshExp <= now) {
//             logout();
//             window.location.href = '/login';
//             return;
//         }

//         // Nếu accessToken gần hết hạn (<2 phút), refresh ngay
//         if (accessExp - now < 120_000) {
//             refreshToken().catch(() => {
//                 logout();
//                 window.location.href = '/login';
//             });
//             return;
//         }

//         // Schedule interval để check mỗi 30s
//         const interval = setInterval(async () => {
//             const currentAccessToken = Cookies.get("accessToken");
//             if (!currentAccessToken) {
//                 clearInterval(interval);
//                 logout();
//                 window.location.href = '/login';
//                 return;
//             }

//             try {
//                 const decoded = jwtDecode<JwtPayload>(currentAccessToken);
//                 const exp = decoded.exp * 1000;
//                 if (exp - Date.now() < 120_000) { // Refresh nếu còn <2 phút
//                     await refreshToken();
//                     console.log("Refreshed access token proactively");
//                 }
//             } catch (err) {
//                 console.error("Error checking token:", err);
//                 clearInterval(interval);
//                 logout();
//                 window.location.href = '/login';
//             }
//         }, 30_000); // Check mỗi 30s

//         // Cleanup khi component unmount
//         return () => clearInterval(interval);
//     } catch (err) {
//         console.error("Error decoding token:", err);
//         logout();
//         window.location.href = '/login';
//     }
// };
