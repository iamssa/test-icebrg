export const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

export const isTokenExpired = (token: string) => {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;

    const expirationTime = payload.exp * 1000; // Конвертируем секунды в миллисекунды
    const currentTime = Date.now();

    return currentTime > expirationTime;
}

export const shouldRefreshToken = (token: string) => {
    const payload = parseJwt(token);

    if (!payload || !payload.exp) {
        return true;
    }

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;

    return timeUntilExpiry < 60 * 1000;
}
