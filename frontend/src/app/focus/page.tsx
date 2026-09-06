"use client";

import {useRouter} from "next/navigation";
import {
    ArrowRight,
    Clock3,
    Timer,
    Zap,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";

import styles from "./page.module.css";

function FocusContent() {
    const router = useRouter();

    return (
        <AppShell>
            <main className={styles.page}>
                <header className={styles.header}>
                    <div>
                        <div className={styles.eyebrow}>
                            <Timer size={15}/>
                            Focus session
                        </div>

                        <h1 className={styles.title}>
                            Focus
                        </h1>

                        <p className={styles.subtitle}>
                            Choose how you want to study today.
                            Start freely or add a little structure
                            first.
                        </p>
                    </div>
                </header>

                <section className={styles.modeGrid}>
                    <button
                        type="button"
                        className={styles.modeCard}
                        onClick={() =>
                            router.push("/focus/quick")
                        }
                    >
                        <div className={styles.iconWrapper}>
                            <Zap size={21}/>
                        </div>

                        <div className={styles.cardContent}>
                            <div>
                                <span
                                    className={
                                        styles.cardEyebrow
                                    }
                                >
                                    Start freely
                                </span>

                                <h2>Quick Focus</h2>
                            </div>

                            <p>
                                Enter a focus space and start
                                when you are ready. Study for
                                as long as you want.
                            </p>

                            <div className={styles.cardFooter}>
                                <span>
                                    Enter focus space
                                </span>

                                <ArrowRight size={16}/>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={styles.modeCard}
                        onClick={() =>
                            router.push("/focus/planned")
                        }
                    >
                        <div className={styles.iconWrapper}>
                            <Clock3 size={21}/>
                        </div>

                        <div className={styles.cardContent}>
                            <div>
                                <span
                                    className={
                                        styles.cardEyebrow
                                    }
                                >
                                    Add structure
                                </span>

                                <h2>Planned Focus</h2>
                            </div>

                            <p>
                                Choose a duration and optionally
                                connect your session to a course
                                and topic.
                            </p>

                            <div className={styles.cardFooter}>
                                <span>
                                    Set up your session
                                </span>

                                <ArrowRight size={16}/>
                            </div>
                        </div>
                    </button>
                </section>

                <div className={styles.consistencyNote}>
                    <Timer size={16}/>

                    <span>
                        Both session types count equally toward
                        your study consistency.
                    </span>
                </div>
            </main>
        </AppShell>
    );
}

export default function FocusPage() {
    return (
        <ProtectedRoute>
            <FocusContent/>
        </ProtectedRoute>
    );
}