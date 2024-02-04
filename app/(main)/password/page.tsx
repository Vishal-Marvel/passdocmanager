import CustomSignOutButton from "@/components/CustomSignOutButton";
import {PasswordsTable} from "@/components/password/PasswordsTable";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { initProfile } from "@/lib/init-profile";

export default async function Password() {
    const user = await initProfile();
    
    return (
        <div className={"p-2 md:m-2  flex flex-col "}>
            <div className={"flex w-full justify-end gap-4 sticky"}>
                    <Link href={"/"} className={buttonVariants({variant:"outline"})}> Dashboard </Link>
                    <CustomSignOutButton/>
            </div>
            <div className={"w-full justify-center items-center flex flex-col pt-4"}>
                <h1 className={"font-bold text-2xl m-2 p-2 font-sans"}>Passwords</h1>
                
                <PasswordsTable />
                                
            </div>  
        </div>
    )
}