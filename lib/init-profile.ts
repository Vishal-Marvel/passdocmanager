import {auth, redirectToSignIn} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";

export const initProfile = async () =>{
    const {userId} = auth();
    const currentDate = new Date();
    if (!userId){
        return redirectToSignIn();
    }
    const profile = await db.user.findUnique({
        where: {
            userId
        }
    });


    if (profile) {

        // if (profile.updatedAt){
        //     const profileDate = profile.updatedAt;
        //     profileDate.setDate(profileDate.getDate()+  20);
        //
        //     if (profileDate <= currentDate){
        //         return redirect("/setPassword") ;
        //     }
        //
        // }else{
        //     return redirect("/setPassword") ;
        // }
        return profile;
    }else{
        // console.log(user)
        return redirect("/setPassword") ;
    }

}