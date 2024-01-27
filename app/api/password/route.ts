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

function decrypt(password: string, encrptedString: string, salt: string) {

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, salt);
    let decryptedText = decipher.update(encrptedString, "hex", "utf-8");
    decryptedText += decipher.final("utf-8");
    return decryptedText;
}

// Function to compare hashed and original strings
async function compareStrings(originalString: string, hashedString: string) {
    return await bcrypt.compare(originalString, hashedString);
}


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
        const { id, password, value } = await req.json();
        if (!user) {
            return new NextResponse("User Not Exists", { status: 400 })
        }

        if (!await compareStrings(password, user.viewPassword)) {
            return new NextResponse("Password Incorrect", { status: 400 })
        }

        const record = await db.password.findFirst({
            where: {
                id
            }
        })
        if (!record || record.userId !== user.id) {
            return new NextResponse("Record Not Found", { status: 404 })
        }


        const { encryptedText, salt } = encrypt(value, password);

        await db.password.update({
            where: { id: record.id },
            data: {
                value: encryptedText,
                salt
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