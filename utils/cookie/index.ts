import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie'


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

    console.log("Access Token Expiry Days:", expiresInDaysAccessToken);
    console.log("Refresh Token Expiry Days:", expiresInDaysRefreshToken);

    Cookies.set('accessToken', accessToken, { expires: expiresInDaysAccessToken, secure: true });
    Cookies.set('refreshToken', refreshToken, { expires: expiresInDaysRefreshToken, secure: true });
    Cookies.set('user', JSON.stringify(user), { expires: expiresInDaysRefreshToken, secure: true })
}

export const getAccessTokenFromCookie = (): string | null => {
    const token = Cookies.get("accessToken");
    return token || null;
}

export function accessTokenAlmostExpired(thresholdSeconds = 120): boolean {
    const token = Cookies.get("accessToken");
    if (!token) return true;
    try {
        const decoded: any = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);
        // Nếu còn ít hơn thresholdSeconds thì coi như sắp hết hạn
        return decoded.exp - now < thresholdSeconds;
    } catch {
        return true;
    }
}


export const clearAuthCookies = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
};