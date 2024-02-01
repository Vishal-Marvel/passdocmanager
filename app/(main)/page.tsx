import CustomSignOutButton from "@/components/CustomSignOutButton";
import { FileCheck2, KeyRound } from 'lucide-react';
import Link from "next/link";
import { initProfile } from "@/lib/init-profile";

import { buttonVariants } from "@/components/ui/button";


export default async function Home() {
  const profile = await initProfile();
  return (
    <div className={"m-2 p-2 flex flex-col "}>
      <div className={"flex w-full justify-end gap-4 sticky"}>
        <Link href={"/setPassword"} className={buttonVariants({variant: "outline"})}> Reset Password </Link>
        <CustomSignOutButton/>
      </div>
      <div className="h-[60vh] flex flex-col justify-center">
        <div className={"flex flex-col h-1/2 items-center text-center"}>
          <span className={"text-3xl font-bold font-poppins"}>PASSWORD AND DOCUMENT MANAGER</span>
          <div className={"w-1/2 justify-around m-3 p-2 flex pt-8 "}>

            <Link className={"h-[150px] w-[150px] border-8 border-blue-300  transform-all duration-200 hover:-translate-y-4 rounded-2xl m-2 p-2 shadow-xl grid place-items-center"}
              href={"/password"}>
              <KeyRound className={"h-20 w-20 p-4"} color={"#93c5fd"} />
              <span className="font-semibold text-sm ">Password</span>
            </Link>

            <Link className={"h-[150px] w-[150px] border-8 border-blue-300  transform-all duration-200 hover:-translate-y-4 rounded-2xl m-2 p-2 shadow-xl grid place-items-center"}
              href={"/document"}>
              <FileCheck2 className={"h-20 w-20 p-4"} color={"#93c5fd"} />
              <span className="font-semibold text-sm">Document</span>

            </Link>

          </div>
        </div>
      </div>
    </div>

  );
}
