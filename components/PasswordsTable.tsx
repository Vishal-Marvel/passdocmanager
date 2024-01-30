"use client"

import axios from "axios";
import {  useEffect, useState } from "react";
import { PasswordBox } from "./PasswordBox";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import AddPassword from "./AddPassword";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "./ui/scroll-area";
import { Category } from "@prisma/client";


export interface Password {
    id: string
    key: string
    updatedAt: Date
    creawtedAt: Date
    category: Category

}

function isMobileView() {
    // Get the width of the viewport
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    // Define the threshold width for mobile view
    const mobileWidthThreshold = 1030; // Adjust this value as needed for your design

    // Check if the viewport width is less than the mobile threshold
    return viewportWidth < mobileWidthThreshold;
}

export const PasswordsTable = () => {
    const [passwords, setPasswords] = useState<Password[]>([]);
    const [visible, setVisible] = useState<Password[]>([])
    const [newField, setNewField] = useState(false);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [span, setSpan] = useState(isMobileView() ? 0 :4);

    const getPasswords = async () => {
        // console.log("loaing");
        const password_data = await axios.get("/api/password")
            .then(r => r.data)
            .catch(e => console.error(e))
        setPasswords(password_data);
        setIsLoading(false);
    }
    const handleSearch = (value: string) => {
        setSearch(value);
        const filtered = passwords?.filter((password) => password.key.toLowerCase().includes(value.toLowerCase())|| password.category.name.toLowerCase().includes(value.toLowerCase()));
        setVisible(filtered);

    }

    useEffect(()=>{
        const handleResize = () =>{
            const  width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            if (width<1030){
                // console.log(0)
                setSpan(0);
            }else{
                // console.log(4)
                setSpan(4)
            }

        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    } ,[])

    useEffect(() => {
        getPasswords()
        // const timer = setInterval(() => getPasswords(), 2000);
        // return () => clearInterval(timer);
    }, [newField])

    useEffect(() => {
        handleSearch(search);
    }, [passwords, search])


    return (
        <div className="md:w-[80vw] w-full overflow-clip flex flex-col items-center">
            <div className="md:w-[60vw] flex md:flex-row flex-col gap-4 justify-center items-center m-2">
                <Input className="border-2 " placeholder="Search Key or Category..." value={search} onChange={(e) => handleSearch(e.target.value)} />
                <AddPassword onSubmitChange={() => setNewField(!newField)} />
            </div>
            {isLoading &&
                <div className="flex w-full h-[40vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                </div>
            }
            {!isLoading && passwords && passwords.length === 0 &&
                <div className="flex w-full h-[40vh] items-center justify-center text-2xl font-bold">
                    No Record Found
                </div>
            }

            {passwords && passwords.length > 0 &&
            // <div className="flex justify-center w-full">
                <ScrollArea className={"h-[60vh] md:w-[60vw] w-[80vw] md:m-4 mb-0 transition-all duration-200 ease-in"}>

                    <Table className="table-auto">
                        <TableHeader className={"sticky top-0 bg-secondary"}>
                            <TableRow className={"text-indigo-950"}>
                                <TableHead className={"hidden lg:table-cell "}>S. No.</TableHead>
                                <TableHead className={""}>Key</TableHead>
                                <TableHead className={"text-center"}>Value</TableHead>
                                <TableHead className={"hidden lg:table-cell "}>Category</TableHead>
                                <TableHead className={"w-1/6 hidden lg:table-cell "}>Updated At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visible.map((record, index) => (
                                <TableRow key={record.id}>
                                    <TableCell className="hidden lg:table-cell ">{index + 1}</TableCell>
                                    <TableCell className="">{record.key}</TableCell>
                                    <TableCell className="text-center"><PasswordBox password={record} onSubmitChange={() => setNewField(!newField)}/></TableCell>
                            
                                    <TableCell className={"hidden lg:table-cell "}>{record.category.name}</TableCell>
                                    <TableCell className={"hidden lg:table-cell "}>{record.updatedAt.toLocaleString().slice(0, 10)}</TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter className={"sticky bottom-0 bg-secondary"}>
                            <TableRow>
                                <TableCell colSpan={span}>Total</TableCell>
                                <TableCell className="lg:text-right text-center">{visible.length} Records(s)</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </ScrollArea>
                // </div>
            }
        </div>
    )
}