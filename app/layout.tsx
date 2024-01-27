import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import {ClerkProvider} from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner"
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", });

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
           
            {children}          
            
            <Toaster position="top-right"/>
          </body>
          
        </html>
      </ClerkProvider>
  );
}
