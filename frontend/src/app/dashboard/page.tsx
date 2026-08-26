"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/auth/useAuth";

function DashboardContent() {
    const { user } = useAuth();

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "var(--cream)",
                padding: "60px",
            }}
        >
            <h1
                style={{
                    color: "var(--deep-teal)",
                }}
            >
                Welcome, {user?.displayName}
            </h1>

            <p>
                Authentication is now managed by AuthProvider.
            </p>
        </main>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}