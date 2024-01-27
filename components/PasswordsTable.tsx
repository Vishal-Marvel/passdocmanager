"use client"

import axios from "axios";
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react";
import { PasswordBox } from "./PasswordBox";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
export interface Password {
    id: string
    key: string
}

export const PasswordsTable = () => {
    const [passwords, setPasswords] = useState<Password[] | undefined>();
    const [search, setSearch] = useState("");

    const getPasswords = async () => {
        const password_data = await axios.get("/api/password")
            .then(r => r.data)
            .catch(e => console.error(e))
        setPasswords(password_data);
        handleSearch(search);
    }
    const handleSearch = (value:string) =>{
        setSearch(value);
        const filtered = passwords?.filter((password)=>password.key.includes(value));
        setPasswords(filtered);

    }

    useEffect(() => {

        const timer = setInterval(() => getPasswords(), 2000);

        return () => clearInterval(timer);
    }, [])
    // useEffect(()=>{
    //     getPasswords()
    // },[])
    return (
        <div className="md:w-[80%] w-full">
            <div></div>
            <Input className="border-2 " placeholder="Search..." value={search} onChange={(e)=>handleSearch(e.target.value)}/>
            {!passwords &&
                <div className="flex w-[80vw] h-[40vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                </div>
            }
             {passwords && passwords.length===0 &&
                <div className="flex w-[80vw] h-[40vh] items-center justify-center text-2xl font-bold">
                    No Record Found 
                </div>
            }
            
            <div className="w-[80vw] flex flex-wrap md:m-4 p-2">

                {passwords && passwords.length > 0 && passwords.map((password, index) => (
                    <PasswordBox password={password} key={index} />
                ))}
            </div>
            
           
        </div>
    )
}