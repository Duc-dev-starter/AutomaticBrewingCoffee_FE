import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie'
import { refreshToken } from "@/services/auth.service";


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

    scheduleTokenRefresh(accessToken);
}

export const getAccessTokenFromCookie = (): string | null => {
    const token = Cookies.get("accessToken");
    return token || null;
}

export const scheduleTokenRefresh = (accessToken: string) => {
    const decodedAccessToken = jwtDecode<JwtPayload>(accessToken);
    const exp = decodedAccessToken.exp * 1000;
    const now = Date.now();

    const delay = exp - now - 60_000;

    if (delay > 0) {
        setTimeout(async () => {
            try {
                const newToken = await refreshToken();
                console.log("Refreshed access token");
            } catch (err) {
                console.error("Refresh token failed", err);
            }
        }, delay);
    }
};
