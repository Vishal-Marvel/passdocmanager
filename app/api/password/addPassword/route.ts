import {NextResponse} from "next/server";

import {compareStrings, encrypt} from "@/lib/encryption-server";

import {currentProfile} from "@/lib/current-profile";
import {db} from "@/lib/db";


export async function POST(
    req: Request
) {
    try {
        const user = await currentProfile();
        const {key, password, value, category} = await req.json();
        if (!user) {
            return new NextResponse("User Not Exists", {status: 400})
        }

        if (!await compareStrings(password, user.viewPassword)) {
            return new NextResponse("Password Incorrect", {status: 400})
        }
        if (!key || !password || !value || !category) {
            return new NextResponse("Key, Value, Password or Category is missing", {status: 404})
        }


        const record = await db.password.findFirst({
            where: {
                key,
                userId: user.id
            }
        })
        if (record) {
            return new NextResponse("Key Already Exists", {status: 405})
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

        const {encryptedText, salt} = encrypt(value, password);

        await db.password.create({
            data: {
                userId: user.id,
                key,
                value: encryptedText,
                salt,
                categoryId: categoryRecord.id

            }
        });
        return NextResponse.json("Added");


    } catch (error) {
        console.log("ADD PASSWORD", error);
        if (String(error).includes("bad decrypt"))
            return new NextResponse("Cant Decrypt", {status: 500});

        return new NextResponse("Internal Error", {status: 500});
    }
}