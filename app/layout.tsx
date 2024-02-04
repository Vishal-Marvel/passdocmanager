import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import React from "react";
import {ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, SignInButton} from "@clerk/nextjs";
import {Toaster} from "@/components/ui/sonner"
import {LockIcon} from "lucide-react";
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
            <body className={cn(inter.className)}>
            <SignedIn>
                {children}
            </SignedIn>
            <SignedOut>

                <RedirectToSignIn/>
                {children}
            </SignedOut>
            <Toaster position="top-right"/>
            <div
                className={"gap-2 w-full flex justify-center text-gray-400 items-center text-sm text-center sticky bottom-2 "}>
                <LockIcon className={"h-4 w-4"}/> End to End Encrypted
            </div>
            </body>

            </html>
        </ClerkProvider>
    );
}
