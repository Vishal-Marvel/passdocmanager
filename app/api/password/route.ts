import {NextResponse} from "next/server";

import {currentUser} from "@clerk/nextjs";
import {db} from "@/lib/db";
import bcrypt from "bcrypt";
import {User} from "@clerk/backend";
import {currentProfile} from "@/lib/current-profile";


async function hashString(inputString:string) {
    const saltRounds = 15;
    return await bcrypt.hash(inputString, saltRounds);
}
// Function to compare hashed and original strings
async function compareStrings(originalString:string , hashedString:string ) {
    return await bcrypt.compare(originalString, hashedString);
}

export async function POST(
    req:Request
){
    try{
        const user= await currentProfile();
        const {key, value, password} = await req.json();
        // @ts-ignore
        const email = user?.email;
        if (!user){
            return new NextResponse("User Not Exists", {status: 400})
        }

        if (!await compareStrings(password, user.viewPassword)){
            return new NextResponse("Password Incorrect", {status: 400})
        }
        const hashedValue = await hashString(value);

        const new_data = await db.password.create({
            data: {
                userId: user.id,
                key,
                value:hashedValue,
            }
        });
        return NextResponse.json(new_data);


    }catch (error){
        console.log("SIGNUP", error)
        return new NextResponse("Internal Error", {status: 500});
    }
}

export async function GET(){
    try{
        const user= await currentProfile();
        // @ts-ignore
        const email = user?.email;
        if (!user){
            return new NextResponse("User Not Exists", {status: 400})
        }

        const pairs = db.password.findMany({
            where:{
                userId:user.id
            }
        });

        return NextResponse.json(pairs);


    }catch (error){
        console.log("SIGNUP", error)
        return new NextResponse("Internal Error", {status: 500});
    }
}