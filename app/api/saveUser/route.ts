import {NextResponse} from "next/server";

import {currentUser} from "@clerk/nextjs";
import {db} from "@/lib/db";
import { hashString } from "@/lib/encryption-server";




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
        const existingProfile = await db.user.findUnique({
            where: {
                userId: user.id
            }
        });
        if (existingProfile){
            return new NextResponse("User Already Exists", {status: 400})
        }
        const password = await hashString(viewPassword);

        await db.user.create({
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