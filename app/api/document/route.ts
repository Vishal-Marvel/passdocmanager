import {NextResponse} from "next/server";

import {encrypt, decrypt, compareStrings} from "@/lib/encryption-server"


import {currentProfile} from "@/lib/current-profile";
import {db} from "@/lib/db";
import {Document} from "@prisma/client";


export async function POST(
    req: Request
) {
    try {
        const user = await currentProfile();
        const {id, password} = await req.json();
        if (!user) {
            return new NextResponse("User Not Exists", {status: 400})
        }
        if (!password) {
            return new NextResponse("Password Is required", {status: 404})
        }

        if (!await compareStrings(password, user.viewPassword)) {
            return new NextResponse("Password Incorrect", {status: 400})
        }

        const record: Document = await db.document.findFirst({
            where: {
                id
            }
        })
        if (!record) {
            return new NextResponse("Record Not Found", {status: 404})
        }
        const decryptedData = decrypt(password, record.document, record.salt)

        return NextResponse.json({value: decryptedData});


    } catch (error) {
        console.log("VIEW DOCUMENT", error);
        if (String(error).includes("bad decrypt")) return new NextResponse("Cant Decrypt", {status: 500});

        return new NextResponse("Internal Error", {status: 500});
    }
}

export async function PUT(
    req: Request
) {
    try {
        const user = await currentProfile();
        const {id, password, document, category} = await req.json();
        if (!user) {
            return new NextResponse("User Not Exists", {status: 400})
        }

        if (!await compareStrings(password, user.viewPassword)) {
            return new NextResponse("Password Incorrect", {status: 400})
        }
        if (!password || !document || !category) {
            return new NextResponse("Value, Password or Category is missing", {status: 404})
        }
        const record = await db.document.findFirst({
            where: {
                id
            }
        })
        if (!record || record.userId !== user.id) {
            return new NextResponse("Record Not Found", {status: 404})
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

        const {encryptedText, salt} = encrypt(document, password);

        await db.document.update({
            where: {id: record.id},
            data: {
                document: encryptedText,
                salt,
                categoryId: categoryRecord.id
            }
        });
        return NextResponse.json("Updated");


    } catch (error) {
        console.log("UPDATE DOCUMENT", error);
        if (String(error).includes("bad decrypt")) return new NextResponse("Cant Decrypt", {status: 500});

        return new NextResponse("Internal Error", {status: 500});
    }
}

export async function GET() {
    try {

        const user = await currentProfile();
        if (!user) {
            return new NextResponse("User Not Exists", {status: 400})
        }

        const pairs = await db.document.findMany({
            where: {
                userId: user.id
            },
            include: {
                category: true
            }
        });
        const objWithoutCertainFields = pairs.map((pair: any) => {
            return Object.fromEntries(
                Object.entries(pair).filter(([key]) => key !== 'userId' && key !== 'salt' && key !== 'document')
            )
        });
        return NextResponse.json(objWithoutCertainFields);


    } catch (error) {
        console.log("GET DOCUMENT", error)
        return new NextResponse("Internal Error", {status: 500});
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await currentProfile();
        if (!user) {
            return new NextResponse("User Not Exists", {status: 400})
        }
        const {searchParams} = new URL(req.url);
        const password = searchParams.get("password");
        const id = searchParams.get("id");
        if (!password || !id) {
            return new NextResponse("Password or Id missing", {status: 400});
        }

        const record = await db.document.findFirst({
            where: {
                id
            }
        })
        if (!record || record.userId !== user.id) {
            return new NextResponse("Record Not Found", {status: 404})
        }
        await db.document.delete({
            where: {id}
        })
        return NextResponse.json("Deleted")

    } catch (error) {
        console.log("DELETE DOCUMENT", error)
        return new NextResponse("Internal Error", {status: 500});
    }

}