"use client";

import Link from "next/link";
import {
    BookOpen,
    Boxes,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Flame,
    Gauge,
    History,
    LogOut,
    Settings,
    Timer,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/auth/useAuth";
import styles from "./Sidebar.module.css";

interface SidebarProps {
    open: boolean;
    onToggle: () => void;
}

interface NavigationItem {
    label: string;
    href: string;
    icon: typeof Gauge;
}

const primaryItems: NavigationItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: Gauge,
    },
    {
        label: "Courses",
        href: "/courses",
        icon: BookOpen,
    },
    {
        label: "Focus",
        href: "/focus",
        icon: Timer,
    },
    {
        label: "Tasks",
        href: "/tasks",
        icon: CheckSquare,
    },
];

const progressItems: NavigationItem[] = [
    {
        label: "Sessions",
        href: "/sessions",
        icon: History,
    },
    {
        label: "Streak",
        href: "/streak",
        icon: Flame,
    },
    {
        label: "Collections",
        href: "/collections",
        icon: Boxes,
    },
];

export default function Sidebar({
                                    open,
                                    onToggle,
                                }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();

    function isActive(href: string): boolean {
        return (
            pathname === href ||
            pathname.startsWith(`${href}/`)
        );
    }

    function handleLogout(): void {
        signOut();
        router.replace("/");
    }

    function renderItem(item: NavigationItem) {
        const Icon = item.icon;

        return (
            <Link
                key={item.href}
                href={item.href}
                title={!open ? item.label : undefined}
                className={`${styles.navItem} ${
                    isActive(item.href) ? styles.active : ""
                }`}
            >
                <Icon size={19} />

                {open && (
                    <span className={styles.label}>
            {item.label}
          </span>
                )}
            </Link>
        );
    }

    return (
        <aside
            className={`${styles.sidebar} ${
                open ? styles.open : styles.closed
            }`}
        >
            <div className={styles.top}>
                <Link
                    href="/dashboard"
                    className={styles.brand}
                >
                    <span className={styles.brandMark}>F</span>

                    {open && (
                        <span className={styles.brandText}>
              <strong>FocusBuddy</strong>
              <small>Study consistently.</small>
            </span>
                    )}
                </Link>

                <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={onToggle}
                    aria-label={
                        open ? "Collapse sidebar" : "Open sidebar"
                    }
                >
                    {open ? (
                        <ChevronLeft size={18} />
                    ) : (
                        <ChevronRight size={18} />
                    )}
                </button>
            </div>

            <nav className={styles.navigation}>
                <div className={styles.navGroup}>
                    {primaryItems.map(renderItem)}
                </div>

                <div className={styles.divider} />

                <div className={styles.navGroup}>
                    {progressItems.map(renderItem)}
                </div>
            </nav>

            <div className={styles.bottom}>
                <Link
                    href="/settings"
                    title={!open ? "Settings" : undefined}
                    className={`${styles.navItem} ${
                        isActive("/settings") ? styles.active : ""
                    }`}
                >
                    <Settings size={19} />

                    {open && (
                        <span className={styles.label}>
              Settings
            </span>
                    )}
                </Link>

                <button
                    type="button"
                    title={!open ? "Log out" : undefined}
                    className={styles.logoutButton}
                    onClick={handleLogout}
                >
                    <LogOut size={18} />

                    {open && <span>Log out</span>}
                </button>
            </div>
        </aside>
    );
}