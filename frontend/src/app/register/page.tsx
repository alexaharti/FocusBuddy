"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import styles from "../page.module.css";

export default function RegisterPage() {
    const router = useRouter();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await register(
                displayName,
                email,
                password
            );

            localStorage.setItem(
                "focusbuddy_access_token",
                response.accessToken
            );

            localStorage.setItem(
                "focusbuddy_user",
                JSON.stringify(response.user)
            );

            router.push("/onboarding");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={styles.page}>
            <div className={styles.loginContainer}>
                <header className={styles.brand}>
                    <h1 className={styles.brandName}>FocusBuddy</h1>
                    <p className={styles.tagline}>
                        Study consistently. Learn deeply.
                    </p>
                </header>

                <section className={styles.card}>
                    <h2 className={styles.title}>Create your account</h2>

                    <p className={styles.subtitle}>
                        Start building a study routine that grows with you.
                    </p>

                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                    >
                        <div className={styles.field}>
                            <label
                                className={styles.label}
                                htmlFor="displayName"
                            >
                                Display name
                            </label>

                            <input
                                className={styles.input}
                                id="displayName"
                                type="text"
                                placeholder="Roxy"
                                value={displayName}
                                onChange={(event) =>
                                    setDisplayName(event.target.value)
                                }
                                maxLength={100}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label
                                className={styles.label}
                                htmlFor="email"
                            >
                                Email
                            </label>

                            <input
                                className={styles.input}
                                id="email"
                                type="email"
                                placeholder="roxy@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                maxLength={255}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label
                                className={styles.label}
                                htmlFor="password"
                            >
                                Password
                            </label>

                            <input
                                className={styles.input}
                                id="password"
                                type="password"
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                minLength={8}
                                maxLength={72}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label
                                className={styles.label}
                                htmlFor="confirmPassword"
                            >
                                Confirm password
                            </label>

                            <input
                                className={styles.input}
                                id="confirmPassword"
                                type="password"
                                placeholder="Enter your password again"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                minLength={8}
                                maxLength={72}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        {error && (
                            <p className={styles.error}>{error}</p>
                        )}

                        <button
                            className={styles.loginButton}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        ALREADY HAVE AN ACCOUNT?
                    </div>

                    <p className={styles.register}>
                        Welcome back.
                        <Link
                            className={styles.registerLink}
                            href="/"
                        >
                            Log in
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
}