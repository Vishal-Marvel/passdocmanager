import { NextResponse } from "next/server";

import crypto from "crypto";
import bcrypt from "bcrypt";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

function generateSaltFromPassword(password: string) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex').slice(0, 16); // Use first 16 bytes as salt
}

// An encrypt function
function encrypt(text: string, password: string) {

    const salt = generateSaltFromPassword(password);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    const cipher = crypto.createCipheriv("aes-256-cbc", key, salt);
    let encryptedText = cipher.update(text, "utf-8", "hex");
    encryptedText += cipher.final("hex");
    return { encryptedText, salt };
}
// Function to compare hashed and original strings
async function compareStrings(originalString: string, hashedString: string) {
    return await bcrypt.compare(originalString, hashedString);
}


export async function PUT(
    req: Request
) {
    try {
        const user = await currentProfile();
        const { key, password, value } = await req.json();
        if (!user) {
            return new NextResponse("User Not Exists", { status: 400 })
        }

        if (!await compareStrings(password, user.viewPassword)) {
            return new NextResponse("Password Incorrect", { status: 400 })
        }

        const record = await db.password.findFirst({
            where: {
                key
            }
        })
        if (record) {
            return new NextResponse("Key Already Exists", { status: 405 })
        }


        const { encryptedText, salt } = encrypt(value, password);

        await db.password.create({
            
            data: {
                userId: user.id,
                key,
                value: encryptedText,
                salt
            }
        });
        return NextResponse.json("Added");


    } catch (error) {
        console.log("ADD PASSWORD", error);
        if (String(error).includes("bad decrypt")) 
        return new NextResponse("Cant Decrypt", { status: 500 });

        return new NextResponse("Internal Error", { status: 500 });
    }
}