"use client";

import { useEffect, useState } from "react";

interface User {
    id: number;
    email: string;
    displayName: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser =
            localStorage.getItem("focusbuddy_user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "var(--cream)",
                padding: "60px",
            }}
        >
            <h1 style={{ color: "var(--deep-teal)" }}>
                Welcome, {user?.displayName ?? "FocusBuddy user"}
            </h1>

            <p>
                Login works. The real dashboard comes next.
            </p>
        </main>
    );
}