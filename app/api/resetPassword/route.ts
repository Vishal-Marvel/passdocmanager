import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { compareStrings, hashString } from "@/lib/encryption-server";
import { currentProfile } from "@/lib/current-profile";
import { User } from "@prisma/client";




export async function POST(
    req: Request
) {
    try {
        const user:User | null = await currentProfile();
        const { oldPassword, viewPassword } = await req.json();
        if (!user) {
            return new NextResponse("UnAuthenticated", { status: 401 })
        }
        // @ts-ignore
        if (!await compareStrings(oldPassword, user.viewPassword)){
            return new NextResponse("Current Password Incorrect", { status: 400 })
        }
        if (await compareStrings(viewPassword, user.viewPassword)){
            return new NextResponse("Old Password And New Password should not be same", { status: 400 })
        }

        const password = await hashString(viewPassword);

        await db.user.update({
            where: {id:user.id},
            data: {
                viewPassword: password
            }
        });
        return NextResponse.json("Password Updated");


    } catch (error) {
        console.log("SIGNUP", error)
        return new NextResponse("Internal Error", { status: 500 });
    }
}