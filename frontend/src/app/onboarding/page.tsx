"use client";

import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "var(--cream)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    maxWidth: "520px",
                }}
            >
                <h1
                    style={{
                        color: "var(--deep-teal)",
                        fontSize: "40px",
                        marginBottom: "16px",
                    }}
                >
                    Welcome to FocusBuddy
                </h1>

                <p
                    style={{
                        color: "var(--muted-text)",
                        fontSize: "18px",
                        lineHeight: 1.6,
                    }}
                >
                    Your account is ready. The real onboarding experience
                    comes later.
                </p>

                <button
                    onClick={() => router.push("/dashboard")}
                    style={{
                        marginTop: "28px",
                        background: "var(--deep-teal)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        padding: "14px 28px",
                        fontWeight: 600,
                    }}
                >
                    Continue to Dashboard
                </button>
            </div>
        </main>
    );
}