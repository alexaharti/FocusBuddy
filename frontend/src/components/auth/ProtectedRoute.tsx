"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/auth/useAuth";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({
                                           children,
                                       }: ProtectedRouteProps) {
    const router = useRouter();

    const {
        isAuthenticated,
        isLoading,
    } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/");
        }
    }, [
        isAuthenticated,
        isLoading,
        router,
    ]);

    if (isLoading) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--cream)",
                    color: "var(--deep-teal)",
                }}
            >
                Checking your session...
            </main>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}