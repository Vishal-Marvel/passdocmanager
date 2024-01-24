import {currentUser} from "@clerk/nextjs";

import {db} from "@/lib/db";
import {Users} from "@prisma/client";

export const currentProfile = async () => {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const profile: Users|null = await db.users.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress
        }
    });
    return profile;
}