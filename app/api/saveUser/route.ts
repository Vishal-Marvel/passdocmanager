import {NextResponse} from "next/server";

import {currentUser} from "@clerk/nextjs";
import {db} from "@/lib/db";
import bcrypt from "bcrypt";
import {User} from "@clerk/backend";


async function hashString(inputString:string) {
    const saltRounds = 15;
    return await bcrypt.hash(inputString, saltRounds);
}


export async function POST(
    req:Request
){
    try{
        const user= await currentUser();
        const {viewPassword} = await req.json();
        // @ts-ignore
        const email = user.emailAddresses[0].emailAddress;
        const existingProfile = await db.users.findUnique({
            where: {
                email: user?.emailAddresses[0].emailAddress
            }
        });
        if (existingProfile){
            return new NextResponse("User Already Exists", {status: 400})
        }
        const password = await hashString(viewPassword);

        const new_user = await db.users.create({
            data: {
                email,
                viewPassword:password
            }
        });
        return NextResponse.json(new_user);


    }catch (error){
        console.log("SIGNUP", error)
        return new NextResponse("Internal Error", {status: 500});
    }
}