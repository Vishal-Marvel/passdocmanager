import {currentUser, redirectToSignIn} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";

export const initProfile = async () =>{
    const user = await currentUser();
    if (!user){
        return redirectToSignIn();
    }
    const profile = await db.users.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress
        }
    });


    if (profile) {
        return profile;
    }else{
        // console.log(user)
        return redirect("/signup") ;
    }

}