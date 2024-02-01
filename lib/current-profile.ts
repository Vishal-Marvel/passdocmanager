import {auth, redirectToSignIn} from "@clerk/nextjs";


import {db} from "@/lib/db";
import { User } from "@prisma/client";

export const currentProfile = async () => {
    const {userId} =  auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const profile:User = await db.user.findUnique({
        where: {
            userId
        }
    });
    return profile;
}