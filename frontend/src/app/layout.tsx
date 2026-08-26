import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import AuthProvider from "@/auth/AuthProvider";
import "./globals.css";

const dmSans = DM_Sans({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FocusBuddy",
    description: "Study consistently. Learn deeply.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={dmSans.className}>
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}