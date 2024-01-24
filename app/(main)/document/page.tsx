import {SignedIn} from "@clerk/nextjs";
import CustomSignOutButton from "@/components/CustomSignOutButton";

export default function Document() {
    return (
        <div className={"p-2 m-2  md:flex-row flex flex-col"}>
            <div className={"absolute top-2 right-2"}>
                <SignedIn >
                    <CustomSignOutButton/>
                </SignedIn>
            </div>
            <div className={"w-full justify-center items-center flex flex-col pt-4"}>
                <h1 className={"font-bold text-2xl m-2 p-2 font-sans"}>Documents</h1>

            </div>
        </div>
    )
}