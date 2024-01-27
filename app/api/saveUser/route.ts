import {NextResponse} from "next/server";

import {currentUser} from "@clerk/nextjs";
import {db} from "@/lib/db";
import bcrypt from "bcrypt";
import { User } from "@clerk/nextjs/server";


async function hashString(inputString:string) {
    const saltRounds = 15;
    return await bcrypt.hash(inputString, saltRounds);
}


export async function POST(
    req:Request
){
    try{
        const user = await currentUser();
        const {viewPassword} = await req.json();
        if(!user ){
            return new NextResponse("UnAuthenticated", {status:401})
        }
        // @ts-ignore
        const existingProfile = await db.users.findUnique({
            where: {
                userId: user.id
            }
        });
        if (existingProfile){
            return new NextResponse("User Already Exists", {status: 400})
        }
        console.log(viewPassword);
        const password = await hashString(viewPassword);

        const new_user = await db.users.create({
            data: {
                userId:user.id,
                viewPassword:password
            }
        });
        return NextResponse.json("User Added");


    }catch (error){
        console.log("SIGNUP", error)
        return new NextResponse("Internal Error", {status: 500});
    }
}