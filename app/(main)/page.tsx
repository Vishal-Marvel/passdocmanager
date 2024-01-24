import CustomSignOutButton from "@/components/CustomSignOutButton";
import {SignedIn, SignInButton} from "@clerk/nextjs";
import {FileCheck2, KeyRound} from 'lucide-react';
import Link from "next/link";
import {initProfile} from "@/lib/init-profile";


export default async function Home() {
    const profile = await initProfile();
  return (
      <div className={"w-full h-screen flex flex-col items-center justify-center"}>
          <div className={"absolute top-2 right-2"}>
              <SignedIn >
                <CustomSignOutButton/>
              </SignedIn>
          </div>
        <div className={"flex flex-col h-1/2 items-center"}>
        <span className={"text-3xl font-bold font-poppins"}>PASSWORD AND DOCUMENT MANAGER</span>
          <div className={"w-full justify-around m-3 p-2 flex pt-8 "}>
              <Link className={"border-8 border-blue-300 transform-all duration-200 hover:-translate-y-4 rounded-2xl m-2 p-2 shadow-xl"}
                    href={"/password"}>
                <KeyRound className={"h-20 w-20 p-4"} color={"#93c5fd"}/>
              </Link>
              <Link className={"border-8 border-blue-300 transform-all duration-200 hover:-translate-y-4 rounded-2xl m-2 p-2 shadow-xl"}
                    href={"/document"}>
                  <FileCheck2 className={"h-20 w-20 p-4"} color={"#93c5fd"}/>
              </Link>

          </div>
        </div>
      </div>

  );
}
