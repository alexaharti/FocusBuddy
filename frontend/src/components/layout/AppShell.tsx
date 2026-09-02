"use client";

import type {ReactNode} from "react";
import {useState} from "react";

import AppHeader from "@/components/layout/AppHeader";
import Sidebar from "@/components/layout/Sidebar";

import styles from "./AppShell.module.css";

interface AppShellProps {
    children: ReactNode;
}

export default function AppShell({
                                     children,
                                 }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    return (
        <div className={styles.shell}>
            <Sidebar
                open={sidebarOpen}
                onToggle={() =>
                    setSidebarOpen(
                        (current) => !current
                    )
                }
            />

            <div className={styles.content}>
                <AppHeader/>

                <div className={styles.pageContent}>
                    {children}
                </div>
            </div>
        </div>
    );
}