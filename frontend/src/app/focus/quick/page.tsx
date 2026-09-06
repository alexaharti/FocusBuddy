"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import {useRouter} from "next/navigation";
import {
    ArrowLeft,
    Check,
    Pause,
    Play,
    RotateCcw,
    Timer,
    X,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";

import {
    cancelFocusSession,
    completeFocusSession,
    FocusSession,
    getFocusSessions,
    pauseFocusSession,
    resumeFocusSession,
    startFocusSession,
} from "@/lib/focusSessions";

import styles from "./page.module.css";

type TimerState =
    | "READY"
    | "RUNNING"
    | "PAUSED"
    | "FINISHED";

function formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return [hours, minutes, seconds]
            .map((value) =>
                String(value).padStart(2, "0")
            )
            .join(":");
    }

    return [minutes, seconds]
        .map((value) =>
            String(value).padStart(2, "0")
        )
        .join(":");
}

function QuickFocusContent() {
    const router = useRouter();

    const [timerState, setTimerState] =
        useState<TimerState>("READY");

    const [elapsedSeconds, setElapsedSeconds] =
        useState(0);

    const [session, setSession] =
        useState<FocusSession | null>(null);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [isRestoring, setIsRestoring] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const intervalRef =
        useRef<number | null>(null);

    useEffect(() => {
        async function restoreSession() {
            try {
                const sessions =
                    await getFocusSessions();

                const ongoingSession =
                    sessions.find(
                        (candidate) =>
                            candidate.sessionType === "QUICK" &&
                            (
                                candidate.status === "ACTIVE" ||
                                candidate.status === "PAUSED"
                            )
                    );

                if (!ongoingSession) {
                    return;
                }

                setSession(ongoingSession);

                if (ongoingSession.status === "PAUSED") {
                    setElapsedSeconds(
                        Number(
                            ongoingSession.accumulatedFocusSeconds
                        )
                    );

                    setTimerState("PAUSED");
                    return;
                }

                const resumedAt =
                    ongoingSession.lastResumedAt
                        ? new Date(
                            ongoingSession.lastResumedAt
                        ).getTime()
                        : Date.now();

                const currentIntervalSeconds =
                    Math.max(
                        0,
                        Math.floor(
                            (
                                Date.now() -
                                resumedAt
                            ) / 1000
                        )
                    );

                setElapsedSeconds(
                    Number(
                        ongoingSession.accumulatedFocusSeconds
                    ) + currentIntervalSeconds
                );

                setTimerState("RUNNING");
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "The focus session could not be restored."
                );
            } finally {
                setIsRestoring(false);
            }
        }

        restoreSession();
    }, []);

    useEffect(() => {
        if (
            timerState !== "RUNNING" ||
            !session
        ) {
            return;
        }

        function updateElapsedTime() {
            const storedSeconds =
                Number(
                    session?.accumulatedFocusSeconds ?? 0
                );

            if (!session?.lastResumedAt) {
                setElapsedSeconds(storedSeconds);
                return;
            }

            const resumedAt =
                new Date(
                    session.lastResumedAt
                ).getTime();

            const currentIntervalSeconds =
                Math.max(
                    0,
                    Math.floor(
                        (
                            Date.now() -
                            resumedAt
                        ) / 1000
                    )
                );

            setElapsedSeconds(
                storedSeconds +
                currentIntervalSeconds
            );
        }

        updateElapsedTime();

        intervalRef.current =
            window.setInterval(
                updateElapsedTime,
                1000
            );

        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(
                    intervalRef.current
                );

                intervalRef.current = null;
            }
        };
    }, [timerState, session]);

    async function handleStart() {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const createdSession =
                await startFocusSession({
                    sessionType: "QUICK",
                });

            setSession(createdSession);
            setElapsedSeconds(0);
            setTimerState("RUNNING");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "The focus session could not be started."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handlePause() {
        if (!session || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const pausedSession =
                await pauseFocusSession(session.id);

            setSession(pausedSession);
            setElapsedSeconds(
                Number(
                    pausedSession.accumulatedFocusSeconds
                )
            );
            setTimerState("PAUSED");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "The focus session could not be paused."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResume() {
        if (!session || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const resumedSession =
                await resumeFocusSession(session.id);

            setSession(resumedSession);
            setTimerState("RUNNING");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "The focus session could not be resumed."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleFinish() {
        if (!session || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const completedSession =
                await completeFocusSession(session.id);

            setSession(completedSession);
            setElapsedSeconds(
                Number(
                    completedSession.accumulatedFocusSeconds
                )
            );
            setTimerState("FINISHED");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "The focus session could not be completed."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleCancel() {
        if (!session || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await cancelFocusSession(session.id);

            setSession(null);
            setElapsedSeconds(0);
            setTimerState("READY");

            router.push("/focus");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "The focus session could not be cancelled."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleRestart() {
        setSession(null);
        setElapsedSeconds(0);
        setTimerState("READY");
        setError(null);
    }

    const isRunning =
        timerState === "RUNNING";

    const isPaused =
        timerState === "PAUSED";

    const isFinished =
        timerState === "FINISHED";

    return (
        <AppShell>
            <main className={styles.page}>
                <button
                    type="button"
                    className={styles.backLink}
                    onClick={() =>
                        router.push("/focus")
                    }
                >
                    <ArrowLeft size={15}/>
                    Back to Focus
                </button>

                <header className={styles.header}>
                    <div>
                        <div className={styles.eyebrow}>
                            <Timer size={15}/>
                            Quick Focus
                        </div>

                        <h1 className={styles.title}>
                            Focus freely.
                        </h1>

                        <p className={styles.subtitle}>
                            Start when you are ready.
                            Pause when you need to.
                            Finish when you are done.
                        </p>
                    </div>
                </header>

                <section className={styles.focusLayout}>
                    <div className={styles.timerPanel}>
                        <div className={styles.statusRow}>
                            <span
                                className={`${styles.statusDot} ${
                                    isRunning
                                        ? styles.runningDot
                                        : isPaused
                                            ? styles.pausedDot
                                            : ""
                                }`}
                            />

                            <span className={styles.statusText}>
                                {timerState === "READY" &&
                                    "Ready"}

                                {timerState === "RUNNING" &&
                                    "Focusing"}

                                {timerState === "PAUSED" &&
                                    "Paused"}

                                {timerState === "FINISHED" &&
                                    "Session complete"}
                            </span>
                        </div>

                        {error && (
                            <p className={styles.errorMessage}>
                                {error}
                            </p>
                        )}

                        <div className={styles.timerBlock}>
                            <div className={styles.timerDisplay}>
                                {formatDuration(
                                    elapsedSeconds
                                )}
                            </div>

                            <div className={styles.timerLabel}>
                                Focus time
                            </div>
                        </div>

                        {!isFinished && (
                            <div className={styles.controls}>
                                {timerState === "READY" && (
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={handleStart}
                                        disabled={
                                            isSubmitting ||
                                            isRestoring
                                        }
                                    >
                                        <Play size={17}/>

                                        {isRestoring
                                            ? "Loading..."
                                            : isSubmitting
                                                ? "Starting..."
                                                : "Start"}
                                    </button>
                                )}

                                {isRunning && (
                                    <>
                                        <button
                                            type="button"
                                            className={
                                                styles.secondaryButton
                                            }
                                            onClick={
                                                handlePause
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <Pause size={17}/>
                                            Pause
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                styles.primaryButton
                                            }
                                            onClick={
                                                handleFinish
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <Check size={17}/>
                                            Finish session
                                        </button>
                                    </>
                                )}

                                {isPaused && (
                                    <>
                                        <button
                                            type="button"
                                            className={
                                                styles.secondaryButton
                                            }
                                            onClick={
                                                handleResume
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <Play size={17}/>
                                            Resume
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                styles.primaryButton
                                            }
                                            onClick={
                                                handleFinish
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <Check size={17}/>
                                            Finish session
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {!isFinished &&
                            timerState !== "READY" && (
                                <button
                                    type="button"
                                    className={
                                        styles.cancelButton
                                    }
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    <X size={15}/>
                                    Cancel session
                                </button>
                            )}

                        {isFinished && (
                            <div
                                className={
                                    styles.finishedContent
                                }
                            >
                                <div
                                    className={
                                        styles.finishedIcon
                                    }
                                >
                                    <Check size={23}/>
                                </div>

                                <p>
                                    You focused for{" "}
                                    <strong>
                                        {formatDuration(
                                            elapsedSeconds
                                        )}
                                    </strong>
                                    .
                                </p>

                                <div
                                    className={
                                        styles.finishedActions
                                    }
                                >
                                    <button
                                        type="button"
                                        className={
                                            styles.secondaryButton
                                        }
                                        onClick={
                                            handleRestart
                                        }
                                    >
                                        <RotateCcw
                                            size={16}
                                        />
                                        New session
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            styles.primaryButton
                                        }
                                        onClick={() =>
                                            router.push(
                                                "/focus"
                                            )
                                        }
                                    >
                                        Back to Focus
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.mascotArea}>
                        <div
                            className={
                                styles.mascotGround
                            }
                        />

                        <div
                            className={
                                styles.mascotHint
                            }
                        >
                            Mascot space
                        </div>
                    </div>
                </section>
            </main>
        </AppShell>
    );
}

export default function QuickFocusPage() {
    return (
        <ProtectedRoute>
            <QuickFocusContent/>
        </ProtectedRoute>
    );
}