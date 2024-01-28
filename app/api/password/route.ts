import { NextResponse } from "next/server";

import {encrypt, decrypt, compareStrings} from "@/lib/encryption-server"


import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";


export async function POST(
    req: Request
) {
    try {
        const user = await currentProfile();
        const { id, password } = await req.json();
        if (!user) {
            return new NextResponse("User Not Exists", { status: 400 })
        }
        if (!password){
            return new NextResponse("Password Is required", { status: 404 })
        }

        if (!await compareStrings(password, user.viewPassword)) {
            return new NextResponse("Password Incorrect", { status: 400 })
        }
        
        const record = await db.password.findFirst({
            where: {
                id
            }
        })
        if (!record) {
            return new NextResponse("Record Not Found", { status: 404 })
        }

        const decryptedText = decrypt(password, record.value, record.salt);

        return NextResponse.json({ value: decryptedText });


    } catch (error) {
        console.log("VIEW VALUE", error);
        if (String(error).includes("bad decrypt")) return new NextResponse("Cant Decrypt", { status: 500 });

        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(
    req: Request
) {
    try {
        const user = await currentProfile();
        const { id, password, value, category } = await req.json();
        if (!user) {
            return new NextResponse("User Not Exists", { status: 400 })
        }

        if (!await compareStrings(password, user.viewPassword)) {
            return new NextResponse("Password Incorrect", { status: 400 })
        }
        if (!password || !value || !category){
            return new NextResponse("Value, Password or Category is missing", { status: 404 })
        }
        const record = await db.password.findFirst({
            where: {
                id
            }
        })
        if (!record || record.userId !== user.id) {
            return new NextResponse("Record Not Found", { status: 404 })
        }
        let categoryRecord = await db.category.findFirst({
            where:{
                userId:user.id,
                name:category
            }
        })
        if (!categoryRecord){
            categoryRecord = await db.category.create({
                data:{
                    name:category,
                    userId:user.id
                }
            })
        }

        const { encryptedText, salt } = encrypt(value, password);

        await db.password.update({
            where: { id: record.id },
            data: {
                value: encryptedText,
                salt,
                categoryId:categoryRecord.id
            }
        });
        return NextResponse.json("Updated");


    } catch (error) {
        console.log("UPDATE PASSWORD", error);
        if (String(error).includes("bad decrypt")) return new NextResponse("Cant Decrypt", { status: 500 });

        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET() {
    try {
        
        const user = await currentProfile();
        if (!user) {
            return new NextResponse("User Not Exists", { status: 400 })
        }

        const pairs = await db.password.findMany({
            where: {
                userId: user.id
            },
            include:{
                category:true
            }
        });
        const objWithoutCertainFields = pairs.map((pair:any) => {
            return Object.fromEntries(
                Object.entries(pair).filter(([key]) => key !== 'userId' && key !== 'salt' && key !== 'value')
            )
        });
        return NextResponse.json(objWithoutCertainFields);


    } catch (error) {
        console.log("GET PASSWORd", error)
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await currentProfile();
        if (!user) {
            return new NextResponse("User Not Exists", { status: 400 })
        }
        const { searchParams } = new URL(req.url);
        const password = searchParams.get("password");
        const id = searchParams.get("id");
        if (!password || !id) {
            return new NextResponse("Password or Id missing", { status: 400 });
        }

        const record = await db.password.findFirst({
            where: {
                id
            }
        })
        if (!record || record.userId !== user.id) {
            return new NextResponse("Record Not Found", { status: 404 })
        }
        await db.password.delete({
            where:{id}
        })
        return NextResponse.json("Deleted")

    } catch (error) {
        console.log("DELETE PASSWORd", error)
        return new NextResponse("Internal Error", { status: 500 });
    }

}