export interface AuthUser {
    id: number;
    email: string;
    displayName: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    expiresAt: string;
    user: AuthUser;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

async function readError(response: Response): Promise<string> {
    try {
        const data = await response.json();

        if (typeof data.message === "string") {
            return data.message;
        }
    } catch {
        // Ignore malformed error responses.
    }

    return "Something went wrong. Please try again.";
}

export async function login(
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
}

export async function register(
    displayName: string,
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            displayName,
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
}