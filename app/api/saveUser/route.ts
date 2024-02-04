import { NextResponse } from "next/server";

import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { hashString } from "@/lib/encryption-server";
import { redirect } from "next/navigation";




export async function POST(
    req: Request
) {
    try {
        const user = await currentUser();
        const { viewPassword } = await req.json();
        if (!user) {
            return new NextResponse("UnAuthenticated", { status: 401 })
        }
        // @ts-ignore
        const existingProfile = await db.user.findUnique({
            where: {
                userId: user.id
            }
        });
        const password = await hashString(viewPassword);

        if (existingProfile) {

            return new NextResponse("Password Already Set", { status: 400 })

        }

        await db.user.create({
            data: {
                userId: user.id,
                viewPassword: password
            }
        });
        return NextResponse.json("User Added");


    } catch (error) {
        console.log("SIGNUP", error)
        return new NextResponse("Internal Error", { status: 500 });
    }
}