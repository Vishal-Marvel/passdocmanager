import {SignedIn} from "@clerk/nextjs";
import CustomSignOutButton from "@/components/CustomSignOutButton";
import AddPassword from "@/components/AddPassword";
import {db} from "@/lib/db";
import {currentProfile} from "@/lib/current-profile";

export default async function Password() {
    const user = await currentProfile();
    const passwords = await db.password.findMany({
        where:{
            userId:user?.id
        }
    })
    return (
        <div className={"p-2 m-2  md:flex-row flex flex-col"}>
            <div className={"absolute top-2 right-2"}>
                <SignedIn >
                    <CustomSignOutButton/>
                </SignedIn>
            </div>
            <div className={"w-full justify-center items-center flex flex-col pt-4"}>
                <h1 className={"font-bold text-2xl m-2 p-2 font-sans"}>Password</h1>
                {/*<div className={"absolute top-"}>*/}
                <AddPassword/>
                {/*</div>*/}
                {passwords.length>0 && passwords.map((password, index)=>(
                    <span>
                    {password.key} {password.value}
                    </span>
                ))}
            </div>
        </div>
    )
}