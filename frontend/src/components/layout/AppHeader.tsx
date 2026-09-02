"use client";

import Link from "next/link";
import {Bell} from "lucide-react";
import {usePathname} from "next/navigation";

import {useAuth} from "@/auth/useAuth";
import styles from "./AppHeader.module.css";

const PAGE_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    courses: "Courses",
    focus: "Focus",
    tasks: "Tasks",
    sessions: "Sessions",
    streak: "Streak",
    collections: "Collections",
    settings: "Settings",
};

function formatPathLabel(segment: string): string {
    if (PAGE_LABELS[segment]) {
        return PAGE_LABELS[segment];
    }

    if (/^\d+$/.test(segment)) {
        return "Details";
    }

    return segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

export default function AppHeader() {
    const pathname = usePathname();
    const {user} = useAuth();

    const pathSegments = pathname
        .split("/")
        .filter(Boolean);

    const displayName =
        user?.displayName?.trim() ||
        user?.email?.split("@")[0] ||
        "User";

    const avatarLetter =
        displayName.charAt(0).toUpperCase();

    return (
        <header className={styles.header}>
            <nav
                className={styles.breadcrumbs}
                aria-label="Breadcrumb"
            >
                <Link
                    href="/dashboard"
                    className={styles.rootLink}
                >
                    FocusBuddy
                </Link>

                {pathSegments.map(
                    (segment, index) => {
                        const href = `/${pathSegments
                            .slice(0, index + 1)
                            .join("/")}`;

                        const isLast =
                            index ===
                            pathSegments.length - 1;

                        return (
                            <span
                                className={
                                    styles.breadcrumbPart
                                }
                                key={href}
                            >
                                <span
                                    className={
                                        styles.separator
                                    }
                                    aria-hidden="true"
                                >
                                    /
                                </span>

                                {isLast ? (
                                    <span
                                        className={
                                            styles.currentPage
                                        }
                                    >
                                        {formatPathLabel(
                                            segment
                                        )}
                                    </span>
                                ) : (
                                    <Link
                                        href={href}
                                        className={
                                            styles.breadcrumbLink
                                        }
                                    >
                                        {formatPathLabel(
                                            segment
                                        )}
                                    </Link>
                                )}
                            </span>
                        );
                    }
                )}
            </nav>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.notificationButton}
                    aria-label="Open notifications"
                    title="Notifications"
                >
                    <Bell size={19}/>

                    <span
                        className={styles.notificationDot}
                        aria-hidden="true"
                    />
                </button>

                <Link
                    href="/settings"
                    className={styles.profile}
                    aria-label={`Open profile for ${displayName}`}
                >
                    <span className={styles.avatar}>
                        {avatarLetter}
                    </span>

                    <span className={styles.profileText}>
                        <strong>{displayName}</strong>
                        <small>
                            {user?.email || "Profile"}
                        </small>
                    </span>
                </Link>
            </div>
        </header>
    );
}