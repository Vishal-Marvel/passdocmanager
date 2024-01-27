import CustomSignOutButton from "@/components/CustomSignOutButton";
import AddPassword from "@/components/AddPassword";
import {currentProfile} from "@/lib/current-profile";
import { PasswordsTable } from "@/components/PasswordsTable";

export default async function Password() {
    const user = await currentProfile();
    
    return (
        <div className={"p-2 md:m-2  flex flex-col "}>
            <div className={"flex w-full justify-end"}>
                    <CustomSignOutButton/>
            </div>
            <div className={"w-full justify-center items-center flex flex-col pt-4"}>
                <h1 className={"font-bold text-2xl m-2 p-2 font-sans"}>Passwords</h1>
                
                <PasswordsTable />
                                
            </div>  
        </div>
    )
}