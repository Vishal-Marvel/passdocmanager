"use client"
import {SignOutButton, useClerk} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {Button, buttonVariants} from "@/components/ui/button";
import React, {useState} from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const CustomSignOutButton = () => {
    const [dialog, setDialog] = useState(false)
    const { signOut } = useClerk();
    const router = useRouter();
    return (
        <AlertDialog  open={dialog} onOpenChange={() => setDialog(!dialog)}>
            <AlertDialogTrigger className={buttonVariants({variant: "default"})}>
                Sign Out
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Sign Out?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => signOut(() => router.push("/"))}>Sign Out</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    )
}
export default CustomSignOutButton;