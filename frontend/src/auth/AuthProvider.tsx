"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    login as sendLoginRequest,
    register as sendRegisterRequest,
    type AuthUser,
} from "@/lib/auth";

import {
    clearAuth,
    loadAuth,
    saveAuth,
} from "@/auth/authStorage";

export interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    signIn: (
        email: string,
        password: string
    ) => Promise<void>;

    signUp: (
        displayName: string,
        email: string,
        password: string
    ) => Promise<void>;

    signOut: () => void;
}

export const AuthContext =
    createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({
                                         children,
                                     }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = window.setTimeout(() => {
            const storedAuth = loadAuth();

            if (storedAuth) {
                setUser(storedAuth.user);
                setToken(storedAuth.token);
            }

            setIsLoading(false);
        }, 0);

        return () => {
            window.clearTimeout(restoreSession);
        };
    }, []);

    const signIn = useCallback(
        async (
            email: string,
            password: string
        ): Promise<void> => {
            const response = await sendLoginRequest(email, password);

            saveAuth(response);
            setUser(response.user);
            setToken(response.accessToken);
        },
        []
    );

    const signUp = useCallback(
        async (
            displayName: string,
            email: string,
            password: string
        ): Promise<void> => {
            const response = await sendRegisterRequest(
                displayName,
                email,
                password
            );

            saveAuth(response);
            setUser(response.user);
            setToken(response.accessToken);
        },
        []
    );

    const signOut = useCallback((): void => {
        clearAuth();
        setUser(null);
        setToken(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(user && token),
            isLoading,
            signIn,
            signUp,
            signOut,
        }),
        [
            user,
            token,
            isLoading,
            signIn,
            signUp,
            signOut,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}