"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import styles from "./page.module.css";
import DevAccountSwitcher from "@/components/DevAccountSwitcher";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);

      localStorage.setItem(
          "focusbuddy_access_token",
          response.accessToken
      );

      localStorage.setItem(
          "focusbuddy_user",
          JSON.stringify(response.user)
      );

      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
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
            <h2 className={styles.title}>Welcome back</h2>

            <p className={styles.subtitle}>
              Sign in and continue where you left off.
            </p>

            <form
                className={styles.form}
                onSubmit={handleSubmit}
            >
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
                    name="email"
                    type="email"
                    placeholder="roxy@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
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
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
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
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className={styles.divider}>
              NEW TO FOCUSBUDDY?
            </div>

            <p className={styles.register}>
              Create your study space.
              <Link
                  className={styles.registerLink}
                  href="/register"
              >
                Create account
              </Link>
            </p>
          </section>
        </div>

        <DevAccountSwitcher
            onUseAccount={(email, password) => {
              setEmail(email);
              setPassword(password);
            }}
        />
      </main>
  );
}