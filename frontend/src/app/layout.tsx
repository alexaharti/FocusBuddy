import type { Metadata } from "next";
import {
    Cormorant_Garamond,
    DM_Sans,
} from "next/font/google";

import AuthProvider from "@/auth/AuthProvider";
import "./globals.css";

const dmSans = DM_Sans({
    subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["500", "600"],
    variable: "--font-timer",
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
        <body
            className={`${dmSans.className} ${cormorant.variable}`}
        >
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}