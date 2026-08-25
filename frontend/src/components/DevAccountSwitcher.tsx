"use client";

import { useState } from "react";
import styles from "./DevAccountSwitcher.module.css";

interface DevAccountSwitcherProps {
    onUseAccount: (email: string, password: string) => void;
}

const DEV_ACCOUNTS = [
    {
        email: "alexa@example.com",
        password: "StrongPassword123!",
    },
    {
        email: "roxy@example.com",
        password: "StrongPassword123!",
    },
];

export default function DevAccountSwitcher({
                                               onUseAccount,
                                           }: DevAccountSwitcherProps) {
    const [open, setOpen] = useState(false);

    if (process.env.NODE_ENV === "production") {
        return null;
    }

    return (
        <div className={styles.wrapper}>
            {open && (
                <div className={styles.panel}>
                    <div className={styles.header}>
                        <div>
                            <h3>Dev Accounts</h3>
                            <p>Quick login helpers</p>
                        </div>

                        <button
                            className={styles.closeButton}
                            onClick={() => setOpen(false)}
                            type="button"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.accounts}>
                        {DEV_ACCOUNTS.map((account) => (
                            <div
                                className={styles.accountCard}
                                key={account.email}
                            >
                                <div>
                                    <strong>{account.email}</strong>
                                    <span>{account.password}</span>
                                </div>

                                <button
                                    className={styles.useButton}
                                    type="button"
                                    onClick={() => {
                                        onUseAccount(
                                            account.email,
                                            account.password
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    Use
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                className={styles.devButton}
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label="Open development account switcher"
            >
                DEV
            </button>
        </div>
    );
}