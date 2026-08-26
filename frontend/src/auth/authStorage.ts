import type { AuthResponse, AuthUser } from "@/lib/auth";

const TOKEN_KEY = "focusbuddy_access_token";
const USER_KEY = "focusbuddy_user";
const EXPIRATION_KEY = "focusbuddy_token_expiration";

export interface StoredAuth {
    token: string;
    user: AuthUser;
    expiresAt: string;
}

function browserStorageAvailable(): boolean {
    return typeof window !== "undefined";
}

export function saveAuth(response: AuthResponse): void {
    if (!browserStorageAvailable()) {
        return;
    }

    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(EXPIRATION_KEY, response.expiresAt);
}

export function loadAuth(): StoredAuth | null {
    if (!browserStorageAvailable()) {
        return null;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const expiresAt = localStorage.getItem(EXPIRATION_KEY);

    if (!token || !storedUser || !expiresAt) {
        clearAuth();
        return null;
    }

    const expirationTime = Date.parse(expiresAt);

    if (
        Number.isNaN(expirationTime) ||
        expirationTime <= Date.now()
    ) {
        clearAuth();
        return null;
    }

    try {
        const user = JSON.parse(storedUser) as AuthUser;

        return {
            token,
            user,
            expiresAt,
        };
    } catch {
        clearAuth();
        return null;
    }
}

export function getAccessToken(): string | null {
    return loadAuth()?.token ?? null;
}

export function clearAuth(): void {
    if (!browserStorageAvailable()) {
        return;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRATION_KEY);
}