import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { User } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req:Request) {
    try{
        const user = await currentProfile();
        if (!user){
            return new NextResponse("UnAuthorized", {status:401});
        }
        const {name} = await req.json();
        if (!name){
            return new NextResponse("Name is missing", {status:404})
        }
        const exists = await db.category.findFirst({
            where:{
                name
            }
        });
        if (exists){
            return new NextResponse("Category Already Exists", {status:400});
        }
        await db.category.create({
            data:{
                name,
                userId:user.id
            }
        })
        return NextResponse.json("Category Created");
    }catch(error){
        console.error("ADD CATEGORY", error)
    }
}

export async function GET() {
    try{
        const user:User = await currentProfile();
        if (!user){
            return new NextResponse("UnAuthorized", {status:401});
        }
        const userWithCategory = await db.user.findUnique({
            where:{
                id: user.id,
            },
            include:{
                Category: true,
            },
        
        });
               
        return NextResponse.json({categories: userWithCategory.Category});
    }catch(error){
        console.error("ADD CATEGORY", error)
    }
}