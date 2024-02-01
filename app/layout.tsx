import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import React from "react";
import {ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, SignInButton} from "@clerk/nextjs";
import {Toaster} from "@/components/ui/sonner"
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const inter = Inter({subsets: ["latin"], variable: "--font-sans",});

export const metadata: Metadata = {
    title: "Password Document Manager",
    description: "Manager for Password and Document",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={inter.className}>
            <SignedIn>
                {children}
            </SignedIn>
            <SignedOut>

                <RedirectToSignIn/>
                {children}
            </SignedOut>
            <Toaster position="top-right"/>
            </body>

            </html>
        </ClerkProvider>
    );
}
