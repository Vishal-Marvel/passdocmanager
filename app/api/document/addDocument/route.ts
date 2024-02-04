import {NextRequest, NextResponse} from "next/server";

import {compareStrings, encrypt} from "@/lib/encryption-server";

import {currentProfile} from "@/lib/current-profile";
import {db} from "@/lib/db";
import fs from "fs";


export async function POST(
    req: Request
) {
    try {
        const user = await currentProfile();
        const {name, document, password, category} = await req.json();

        if (!user) {
            return new NextResponse("User Not Exists", {status: 400})
        }

        if (!await compareStrings(password, user.viewPassword)) {
            return new NextResponse("Password Incorrect", {status: 400})
        }

        const record = await db.document.findFirst({
            where: {
                name,
                userId: user.id
            }
        })
        if (record) {
            return new NextResponse("Document Name Already Exists", {status: 405})
        }
        let categoryRecord = await db.category.findFirst({
            where: {
                userId: user.id,
                name: category
            }
        })
        if (!categoryRecord) {
            categoryRecord = await db.category.create({
                data: {
                    name: category,
                    userId: user.id
                }
            })
        }
        const {encryptedText, salt} = encrypt(document, password)

        await db.document.create({
            data: {
                userId: user.id,
                name,
                document: encryptedText,
                salt,
                categoryId: categoryRecord.id

            }
        });
        return NextResponse.json("Added");


    } catch (error) {
        console.log("ADD DOCUMENT", error);
        if (String(error).includes("bad decrypt"))
            return new NextResponse("Cant Decrypt", {status: 500});

        return new NextResponse("Internal Error", {status: 500});
    }
}