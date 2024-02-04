import CustomSignOutButton from "@/components/CustomSignOutButton";
import { Frown } from "lucide-react";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {DocumentTable} from "@/components/document/DocumentsTable";

export default function Document() {
    return (
        <div className={"p-2 m-2  flex flex-col"}>
            <div className={"flex w-full justify-end gap-4 sticky"}>
                <Link href={"/"} className={buttonVariants({ variant: "outline" })}> Dashboard </Link>
                <CustomSignOutButton />
            </div>
            <div className={"w-full justify-center items-center flex flex-col pt-4"}>
                <h1 className={"font-bold text-2xl m-2 p-2 font-sans"}>Documents</h1>
                <DocumentTable/>
            </div>
        </div>
    )
}