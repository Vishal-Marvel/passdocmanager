"use client"
import { useEffect, useState } from "react";
import { Password } from "./PasswordsTable"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger

} from "./ui/dialog"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import qs from "query-string";
import { AlertCircle, Edit, Eye, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { decryptReq, encryptReq } from "@/lib/encryption";

const formSchema = z.object({
    password: z.string().min(8, "Password Is required"),
    value: z.string()
});


export const PasswordBox = ({ password }: { password: Password }) => {
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState("*************");
    const [newValue, setNewValue] = useState("");
    const [time, setTime] = useState(10);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [message, setMessage] = useState("");

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            value: ""
        }
    });
    const encryptData = (password:string, data:string) => {
        setMessage("Encrypting Data")
        return encryptReq(password, data)
    }
    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        
        try {
            const encryptPassword = encryptData(values.password, values.password);
            if (isEdit) {
                if (values.value.length < 1) {
                    form.setError("value", { message: "Value is Required" });
                    form.setFocus("value");
                    return
                }

                const data = {
                    id: password.id,
                    password: encryptPassword,
                    value: encryptReq(values.password, values.value)
                }
                setMessage("Saving data...")
                await axios.put("api/password", data);
                setMessage("")
                form.reset();
                setIsEdit(false);
                toast("Value Updated")
            }else if (isDelete){
                
                const url = qs.stringifyUrl({
                    url: "/api/password",
                    query: {
                        id:password.id,
                        password:encryptPassword
                    }
                });
                setMessage("Deleting data...")
                await axios.delete(url);
                setMessage("")
                form.reset();
                setOpen(false);
                setNewValue("");
                setValue("");
                toast("Deleted")
            } else {
                const data = {
                    id: password.id,
                    password: encryptPassword
                }
                setMessage("Retriving data...")
                const response = (await axios.post("/api/password", data)).data;
                setMessage("")
                setNewValue(decryptReq(values.password, response.value));
                form.reset();
            }

        } catch (error) {
            //@ts-ignore
            toast(<><AlertCircle className="h-4 w-4"/>{error.response.data}</>)
            // console.error(error)
            setMessage("")
        }
    };


    const handleCancelDelete = ()=>{
        setIsDelete(false);
        form.setValue("password" , "");
        form.setFocus("password");
    }

    const handleMouseDown = () => {
        setValue(newValue)
    }
    const handleMouseUp = () => {
        setValue("*************");
    }

    useEffect(() => {
        form.setFocus("password")
    }, [])
    useEffect(() => {
        const timer = setInterval(() => { setNewValue(""); setValue("*************") }, 10000);
        return () => clearInterval(timer);
    }, [newValue])
    useEffect(() => {
        if (newValue != "") {
            const timer = setInterval(() => { setTime(prev => prev - 1) }, 1000);
            return () => clearInterval(timer);
        } else {
            setTime(10);
        }
    }, [newValue]);
    useEffect(() => {
        if (isEdit) {
            form.setFocus("value");
            setNewValue("");
        }
        else
            form.setFocus("password");
    }, [isEdit])


    return (
        <Dialog open={isOpen} onOpenChange={() => { setValue("*************"); setNewValue(""); setOpen(!isOpen) }}>
            <DialogTrigger>
                <div className="min-w-[50px] border-2 border-fuchsia-400 m-2 p-2 rounded-2xl shadow-xl shadow-fuchsia-200 transform-all duration-200 hover:scale-125 hover:ml-6 hover:mr-6  cursor-pointer text-center ">
                    <span className="font-bold ">{password.key}</span>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        View Password
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col">
                    <div className={cn("flex flex-col ", isEdit ? "" : "mb-5")}>
                        <div className="flex-col flex gap-2">
                            <Label>Key:</Label>
                            <span className="w-full  rounded-xl p-2 font-semibold">{password.key}</span>
                        </div>
                        {!isEdit && !isDelete &&
                            <div className="flex-col flex gap-2 mt-3">
                                <Label>Value:</Label>
                                <div className={cn("w-full rounded-xl p-2 flex justify-between md:items-center md:flex-row flex-col")}>
                                    <span className={cn(newValue != "" && value != "*************" && "font-semibold")}>
                                        {value}

                                    </span>
                                    <div className="flex gap-2 ">
                                        {newValue != "" &&
                                            <Eye className="cursor-pointer h-5 w-5 m-2" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} />
                                        }
                                        <Edit className="h-5 w-5 cursor-pointer m-2" onClick={() => setIsEdit(true)} />
                                        <Trash2 className="h-5 w-5 m-2 ml-0 cursor-pointer" onClick={()=>setIsDelete(true)} />
                                    </div>
                                </div>
                                {newValue != "" &&
                                    <span className="text-xs">Value is accessible for {time}s</span>
                                }

                            </div>
                        }
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {isEdit &&
                                <FormField
                                    disabled={isLoading || isDelete}
                                    name={"value"}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Value:</FormLabel>
                                            <div className="flex items-center gap-2">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter Value"
                                                        {...field}
                                                        type={"password"}
                                                    />
                                                </FormControl>

                                                <X className="h-6 w-6 cursor-pointer" onClick={() => setIsEdit(false)} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>

                                    )
                                    } />
                            }
                            <FormField
                                disabled={isLoading}
                                name={"password"}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>

                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder={isEdit ? "Enter Password to Edit the value" : isDelete ? "Enter Password to Delete the record" : "Enter Password to view the value"}
                                                {...field}
                                                type={"password"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                                } />


                            <div className="flex flex-row gap-4 pt-2">
                                {isDelete &&
                                    <Button variant={"outline"} className="w-1/2" onClick={handleCancelDelete}>Cancel Delete</Button>
                                }
                                <Button className={cn(isDelete ? "w-1/2" : "w-full")} disabled={isLoading} type="submit">Submit To {isEdit ? "Edit" : isDelete ? "Delete" : "View"}</Button>
                            </div>
                        </form>
                    </Form>
                </div>
                <DialogFooter>
                    <span className="text-sm">{message}</span>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}