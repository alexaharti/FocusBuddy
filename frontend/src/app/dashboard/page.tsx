"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ArrowRight,
    Bell,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Circle,
    Clock3,
    Flame,
    ListChecks,
    Play,
    Plus,
    Timer,
    UserRound,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/auth/useAuth";
import styles from "./page.module.css";

interface Task {
    id: number;
    title: string;
    course?: string;
    completed: boolean;
}

type TimerMode = "timer" | "25/5" | "50/10";

const initialTasks: Task[] = [
    {
        id: 1,
        title: "Review database normalization",
        course: "Databases",
        completed: false,
    },
    {
        id: 2,
        title: "Read Transport Layer notes",
        course: "Networking",
        completed: true,
    },
    {
        id: 3,
        title: "Finish process synchronization exercise",
        course: "Operating Systems",
        completed: false,
    },
    {
        id: 4,
        title: "Review lecture questions",
        course: "Databases",
        completed: false,
    },
];

const courses = [
    {
        id: 1,
        name: "Operating Systems",
        details: "4 topics · 1 completed",
        color: "#A8B89A",
    },
    {
        id: 2,
        name: "Databases",
        details: "2 topics · In progress",
        color: "#C9785C",
    },
    {
        id: 3,
        name: "Networking",
        details: "3 topics · 2 completed",
        color: "#174C4F",
    },
];

const dailyQuotes = [
    "Small, focused steps become meaningful progress.",
    "You do not need to finish everything today. Just begin.",
    "Consistency makes difficult knowledge feel familiar.",
    "Focus on understanding, not simply counting hours.",
    "Every lecture completed becomes part of what you know.",
    "A calm start is still a strong start.",
    "Progress grows quietly each time you return.",
];

function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 18) {
        return "Good afternoon";
    }

    return "Good evening";
}

function getFormattedDate(): string {
    return new Intl.DateTimeFormat("en", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());
}

function getDayOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);

    return Math.floor(
        (now.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    );
}

function DashboardContent() {
    const { user } = useAuth();

    const [tasks, setTasks] = useState(initialTasks);
    const [timerMode, setTimerMode] =
        useState<TimerMode>("25/5");

    function toggleTask(taskId: number): void {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: !task.completed,
                    }
                    : task
            )
        );
    }

    function getTimerValue(): string {
        switch (timerMode) {
            case "timer":
                return "00:00";
            case "50/10":
                return "50:00";
            default:
                return "25:00";
        }
    }

    function getTimerDescription(): string {
        if (timerMode === "timer") {
            return "Simple timer · Count your focused time";
        }

        return "Focus interval · Session 1 of 4";
    }

    const quote =
        dailyQuotes[getDayOfYear() % dailyQuotes.length];

    return (
        <AppShell>
            <main className={styles.page}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.greeting}>
                            {getGreeting()}, {user?.displayName}
                        </h1>

                        <p className={styles.headerMessage}>
                            Let&apos;s make today focused and meaningful.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
            <span className={styles.date}>
              {getFormattedDate()}
            </span>

                        <button
                            type="button"
                            className={styles.iconButton}
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                        </button>

                        <button
                            type="button"
                            className={styles.profileButton}
                            aria-label="Open profile"
                            title={user?.email}
                        >
                            {user?.displayName
                                ?.charAt(0)
                                .toUpperCase() ?? (
                                <UserRound size={18} />
                            )}
                        </button>
                    </div>
                </header>

                <div className={styles.board}>
                    <div className={styles.leftColumn}>
                        <section
                            className={`${styles.card} ${styles.coursesCard}`}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardIcon}>
                                        <BookOpen size={18} />
                                    </div>

                                    <div>
                                        <h2 className={styles.cardTitle}>
                                            Courses
                                        </h2>

                                        <p className={styles.cardSubtitle}>
                                            Continue your learning
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/courses"
                                    className={styles.textButton}
                                >
                                    View all
                                    <ArrowRight size={13} />
                                </Link>
                            </div>

                            <div className={styles.courseList}>
                                {courses.map((course) => (
                                    <Link
                                        className={styles.course}
                                        href={`/courses/${course.id}`}
                                        key={course.id}
                                    >
                    <span
                        className={styles.courseColor}
                        style={{
                            backgroundColor: course.color,
                        }}
                    />

                                        <div className={styles.courseInfo}>
                                            <strong>{course.name}</strong>
                                            <span>{course.details}</span>
                                        </div>

                                        <ArrowRight
                                            className={styles.courseArrow}
                                            size={15}
                                        />
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section
                            className={`${styles.card} ${styles.focusCard}`}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardIcon}>
                                        <Timer size={18} />
                                    </div>

                                    <div>
                                        <h2 className={styles.cardTitle}>
                                            Focus Timer
                                        </h2>

                                        <p className={styles.cardSubtitle}>
                                            Start a quick focus session
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/focus"
                                    className={styles.textButton}
                                >
                                    Full focus mode
                                    <ArrowRight size={13} />
                                </Link>
                            </div>

                            <div className={styles.focusBody}>
                                <div className={styles.timerArea}>
                                    <div className={styles.modeSelector}>
                                        <button
                                            type="button"
                                            className={`${styles.modeButton} ${
                                                timerMode === "timer"
                                                    ? styles.activeMode
                                                    : ""
                                            }`}
                                            onClick={() => setTimerMode("timer")}
                                        >
                                            Timer
                                        </button>

                                        <button
                                            type="button"
                                            className={`${styles.modeButton} ${
                                                timerMode === "25/5"
                                                    ? styles.activeMode
                                                    : ""
                                            }`}
                                            onClick={() => setTimerMode("25/5")}
                                        >
                                            25 / 5
                                        </button>

                                        <button
                                            type="button"
                                            className={`${styles.modeButton} ${
                                                timerMode === "50/10"
                                                    ? styles.activeMode
                                                    : ""
                                            }`}
                                            onClick={() => setTimerMode("50/10")}
                                        >
                                            50 / 10
                                        </button>
                                    </div>

                                    <div className={styles.timer}>
                                        {getTimerValue()}
                                    </div>

                                    <p className={styles.timerLabel}>
                                        {getTimerDescription()}
                                    </p>

                                    {timerMode !== "timer" && (
                                        <div className={styles.sessionDots}>
                      <span
                          className={`${styles.sessionDot} ${styles.activeDot}`}
                      />
                                            <span className={styles.sessionDot} />
                                            <span className={styles.sessionDot} />
                                            <span className={styles.sessionDot} />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                    >
                                        <Play size={14} fill="currentColor" />
                                        Start
                                    </button>
                                </div>

                                <div className={styles.mascotArea}>
                                    <div className={styles.mascotPlaceholder}>
                                        <span className={styles.mascotHead} />
                                        <span className={styles.mascotBody} />

                                        <span className={styles.mascotText}>
                      Seated
                      <br />
                      3D otter
                    </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className={styles.rightColumn}>
                        <section
                            className={`${styles.card} ${styles.upcomingCard}`}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardIcon}>
                                        <CalendarDays size={18} />
                                    </div>

                                    <div>
                                        <h2 className={styles.cardTitle}>
                                            Upcoming Session
                                        </h2>

                                        <p className={styles.cardSubtitle}>
                                            Your next planned study session
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/sessions"
                                    className={styles.textButton}
                                >
                                    Sessions
                                    <ArrowRight size={13} />
                                </Link>
                            </div>

                            <div className={styles.upcomingBody}>
                                <div className={styles.sessionDate}>
                                    <div>
                                        <strong>27</strong>
                                        <span>Aug</span>
                                    </div>
                                </div>

                                <div className={styles.sessionInfo}>
                                    <strong>Database revision</strong>

                                    <p>
                                        Databases · Normalization review
                                    </p>

                                    <span>
                    <Clock3 size={11} />
                    18:00 · 50 minutes
                  </span>
                                </div>
                            </div>
                        </section>

                        <div className={styles.middleRow}>
                            <Link
                                href="/streak"
                                className={`${styles.card} ${styles.streakCard}`}
                            >
                                <div className={styles.streakTop}>
      <span className={styles.streakTitle}>
        Study streak
      </span>

                                    <ArrowRight
                                        className={styles.streakArrow}
                                        size={16}
                                    />
                                </div>

                                <div className={styles.streakMain}>
                                    <Flame
                                        className={styles.streakFlame}
                                        size={25}
                                    />

                                    <span className={styles.streakNumber}>
        3
      </span>

                                    <span className={styles.streakUnit}>
        days
      </span>
                                </div>

                                <p className={styles.streakRequirement}>
                                    Complete 1 hour of focused study today
                                </p>
                            </Link>

                            <section
                                className={`${styles.card} ${styles.quoteCard}`}
                            >
                                <div className={styles.quoteContent}>
      <span className={styles.quoteLabel}>
        Daily thought
      </span>

                                    <span
                                        className={styles.quoteMark}
                                        aria-hidden="true"
                                    >
        “
      </span>

                                    <blockquote className={styles.quoteText}>
                                        {quote}
                                    </blockquote>
                                </div>

                                <div
                                    className={styles.quoteOtter}
                                    aria-label="Future otter portrait"
                                >
                                    <span className={styles.quoteOtterHead} />
                                    <span className={styles.quoteOtterBody} />
                                </div>
                            </section>
                        </div>

                        <section
                            className={`${styles.card} ${styles.tasksCard}`}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardIcon}>
                                        <ListChecks size={18} />
                                    </div>

                                    <div>
                                        <h2 className={styles.cardTitle}>
                                            Today&apos;s Tasks
                                        </h2>

                                        <p className={styles.cardSubtitle}>
                                            {
                                                tasks.filter(
                                                    (task) => !task.completed
                                                ).length
                                            }{" "}
                                            remaining
                                        </p>
                                    </div>
                                </div>

                                <button
                                    className={styles.addButton}
                                    type="button"
                                >
                                    <Plus size={13} />
                                    Add
                                </button>
                            </div>

                            <div className={styles.taskList}>
                                {tasks.map((task) => (
                                    <div
                                        className={styles.task}
                                        key={task.id}
                                    >
                                        <button
                                            className={styles.taskButton}
                                            type="button"
                                            onClick={() => toggleTask(task.id)}
                                            aria-label={
                                                task.completed
                                                    ? "Mark task incomplete"
                                                    : "Mark task complete"
                                            }
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 size={17} />
                                            ) : (
                                                <Circle size={17} />
                                            )}
                                        </button>

                                        <span
                                            className={`${styles.taskText} ${
                                                task.completed
                                                    ? styles.completedTask
                                                    : ""
                                            }`}
                                        >
                      {task.title}
                    </span>

                                        {task.course && (
                                            <span className={styles.taskCourse}>
                        {task.course}
                      </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className={styles.tasksFooter}>
                                <Link
                                    href="/tasks"
                                    className={styles.seeAllButton}
                                >
                                    See all tasks
                                    <ArrowRight size={12} />
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </AppShell>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}