import {auth, redirectToSignIn} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";

export const initProfile = async () =>{
    const {userId} = auth();
    if (!userId){
        return redirectToSignIn();
    }
    const profile = await db.user.findUnique({
        where: {
            userId
        }
    });


    if (profile) {
        return profile;
    }else{
        // console.log(user)
        return redirect("/signup") ;
    }

}