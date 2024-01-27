import {auth, redirectToSignIn} from "@clerk/nextjs";


import {db} from "@/lib/db";

export const currentProfile = async () => {
    const {userId} =  auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const profile = await db.users.findUnique({
        where: {
            userId
        }
    });
    return profile;
}