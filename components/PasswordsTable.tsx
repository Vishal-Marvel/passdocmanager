"use client"

import axios from "axios";
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react";
import { PasswordBox } from "./PasswordBox";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import AddPassword from "./AddPassword";
export interface Password {
    id: string
    key: string
}

export const PasswordsTable = () => {
    const [passwords, setPasswords] = useState<Password[]>([]);
    const [visible, setVisible] = useState<Password[]>([])
    const [newField, setNewField] = useState(false);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const getPasswords = async () => {
        console.log("loaing");
        const password_data = await axios.get("/api/password")
            .then(r => r.data)
            .catch(e => console.error(e))
        setPasswords(password_data);
        setIsLoading(false);
    }
    const handleSearch = (value:string) =>{
        setSearch(value);
        const filtered = passwords?.filter((password)=>password.key.includes(value));
        setVisible(filtered);

    }

    useEffect(() => {
        getPasswords()
        // const timer = setInterval(() => getPasswords(), 2000);
        // return () => clearInterval(timer);
    }, [newField])
    
    useEffect(()=>{
        handleSearch(search);
    }, [passwords, search])
    return (
        <div className="md:w-[80vw] w-full overflow-clip">
            <div className="flex md:flex-row flex-col gap-4 justify-center items-center">
                <Input className="border-2 " placeholder="Search..." value={search} onChange={(e)=>handleSearch(e.target.value)}/>
                <AddPassword onSubmitChange={()=>setNewField(!newField)}/>
            </div>
            {isLoading &&
                <div className="flex w-full h-[40vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                </div>
            }
             {!isLoading && passwords && passwords.length===0 &&
                <div className="flex w-full h-[40vh] items-center justify-center text-2xl font-bold">
                    No Record Found 
                </div>
            }
            
            <div className="w-full flex flex-wrap md:m-4 p-2">

                {passwords && passwords.length > 0 && visible.map((password, index) => (
                    <PasswordBox password={password} key={index} />
                ))}
            </div>
            
           
        </div>
    )
}