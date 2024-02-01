"use client"
import React, {useEffect, useRef, useState} from "react";
import {Password} from "./PasswordsTable"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger

} from "./ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {toast} from "sonner"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import {Button, buttonVariants} from "./ui/button";
import {Label} from "./ui/label";
import qs from "query-string";
import {AlertCircle, Edit, Eye, EyeOff, Loader2, Trash2, X} from "lucide-react";
import {cn} from "@/lib/utils";
import {decryptReq, encryptReq} from "@/lib/encryption";
import {Category} from "@prisma/client";
import {SearchableSelect} from "./SearchableSelect";
import PasswordInput from "@/components/PasswordInput";

const formSchema = z.object({
    password: z.string().min(8, "Password Is required"),
    value: z.string(),
    category: z.string()
});


interface Props {
    categories: Category[]
    password: Password
    onSubmitChange: () => void
}

export const PasswordBox = ({categories, password, onSubmitChange}: Props) => {
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState("*************");
    const [newValue, setNewValue] = useState("");
    const [time, setTime] = useState(10);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [message, setMessage] = useState("");
    const [focusItem, setFocusItem] = useState("");


    const buttonRef = useRef(null);


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            value: "",
            category: password.category.name
        }
    });
    const encryptData = (password: string, data: string) => {
        setMessage("Encrypting Data")
        return encryptReq(password, data)
    }
    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {

        try {
            const encryptPassword = await encryptData(values.password, values.password);
            if (isEdit) {
                if (values.value.length < 1) {
                    form.setError("value", {message: "Value is Required"});
                    form.setFocus("value");
                    return
                }
                // console.log(values.category);

                const data = {
                    id: password.id,
                    password: encryptPassword,
                    value: encryptReq(values.password, values.value),
                    category: values.category
                }
                setMessage("Saving data...")
                await axios.put("api/password", data);
                setMessage("")
                onSubmitChange();
                form.reset();
                setIsEdit(false);
                toast("Value Updated")
            } else if (isDelete) {

                const url = qs.stringifyUrl({
                    url: "/api/password",
                    query: {
                        id: password.id,
                        password: encryptPassword
                    }
                });
                setMessage("Deleting data...")
                await axios.delete(url);
                setMessage("");
                onSubmitChange();
                form.reset();
                setOpen(false);
                setNewValue("");
                setValue("");
                toast("Data Deleted")
            } else {
                const data = {
                    id: password.id,
                    password: encryptPassword
                }
                setMessage("Retriving data...")
                const response = (await axios.post("/api/password", data)).data;
                setMessage("")
                setNewValue(await decryptReq(values.password, response.value));
                form.reset();
            }

        } catch (error) {
            //@ts-ignore
            toast(<><AlertCircle className="h-4 w-4"/>{error.response.data}</>)
            // console.error(error)
            setMessage("")
        }
    };

    const handleMouseDown = () => {
        setIsMouseDown(true);
        setValue(newValue)
    }
    const handleMouseUp = () => {
        setIsMouseDown(false);

        setValue("*************");
    }
    useEffect(() => {
        if (value === newValue) {
            const timer = setInterval(handleMouseUp, 800);
            return () => clearInterval(timer);
        }
    }, [value])

    useEffect(() => {
        form.setFocus("password")
    }, [])
    useEffect(() => {
        const timer = setInterval(() => {
            setNewValue("");
            setValue("*************");
            setIsMouseDown(false);
        }, 10000);
        return () => clearInterval(timer);
    }, [newValue])
    useEffect(() => {
        if (newValue != "") {
            const timer = setInterval(() => {
                setTime(prev => prev - 1)
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setTime(10);
        }
    }, [newValue]);
    useEffect(() => {
        if (isEdit || isDelete)
            if (isEdit) {
                form.setFocus("value");
                setNewValue("");
            } else
                form.setFocus("password");
        form.resetField("password");
    }, [isEdit, isDelete])
    const handleFocusChange = (event) => {
        if (event.target.id === "react-select-3-input") {
            setFocusItem(event.target.id);
        } else {
            if (focusItem === "react-select-3-input") {
                form.setFocus("password");
                setFocusItem("");
            }
        }
    }

    const handleOnClose = () => {
        setValue("*************");
        setNewValue("");
        setOpen(!isOpen);
        setIsEdit(false);
        setIsDelete(false);
        onSubmitChange();
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleOnClose}>
            <DialogTrigger className={cn(buttonVariants({variant: "link"}), "m-0")}>
                <Eye className="h-5 w-5"/>
            </DialogTrigger>
            <DialogContent className="overflow-hidden h-fit transition-height duration-300 ease-in"
                           onFocusCapture={handleFocusChange}>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? " Edit" : isDelete ? " Delete" : " View"} Record
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col">
                    <div className={cn("flex flex-col ", isEdit ? "" : "mb-5")}>
                        <div className="flex-col flex gap-2">
                            <Label>Key:</Label>
                            <span
                                className="w-full  rounded-xl p-2 font-semibold max-w-[450px] overflow-auto bg-slate-200 cursor-text">{password.key}</span>
                        </div>
                        {!isEdit && !isDelete &&
                            <div className="flex-col flex gap-2 mt-4">
                                <div className="flex gap-2 justify-between">
                                    <Label>Value:</Label>

                                </div>

                                <div className={cn("w-full rounded-xl p-2 flex flex-col")}>
                                    <div className="flex justify-between">
                                        <span
                                            className={cn(newValue != "" && value != "*************" && "font-semibold")}>
                                            {value}

                                        </span>
                                        {(newValue != "" && isMouseDown) ? (

                                            <EyeOff
                                                className="text-black h-5 cursor-pointer w-5 "
                                                onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                                                onTouchCancel={handleMouseUp} onTouchEnd={handleMouseUp}
                                                onTouchMove={handleMouseUp}
                                            />
                                        ) : (
                                            <Eye
                                                className=" text-black  h-5 cursor-pointer w-5 "
                                                onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}
                                            />
                                        )}
                                    </div>
                                    {newValue != "" &&
                                        <span className="text-xs mb-2 font-bold">Value is accessible for {time}s</span>
                                    }

                                </div>
                                <div className="flex-col flex gap-2 ">
                                    <Label>Category:</Label>
                                    <span className="p-2">{password.category.name}</span>
                                </div>
                            </div>
                        }
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-0">
                            {isEdit &&
                                <>
                                    <FormField
                                        disabled={isLoading || isDelete}
                                        name={"value"}
                                        control={form.control}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Value:</FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder="Enter Value"
                                                        {...field}
                                                    />
                                                </FormControl>


                                                <FormMessage/>
                                            </FormItem>

                                        )
                                        }/>
                                    <FormField
                                        disabled={isLoading}
                                        name={"category"}
                                        control={form.control}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Category:</FormLabel>
                                                <FormControl>
                                                    <SearchableSelect defaultValue={field.value}
                                                                      inputOptions={categories.map(category => category.name)}
                                                                      onSelect={field.onChange}/>

                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )
                                        }/>
                                </>
                            }
                            <FormField
                                disabled={isLoading}
                                name={"password"}
                                control={form.control}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password:</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                disabled={isLoading}
                                                placeholder={("Enter Password set after Login to" + (isEdit ? " Edit " : isDelete ? " Delete " : " view ") + "the record")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                                }/>
                            {!isEdit && !isDelete &&
                                <div className="flex gap-10 justify-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Edit className="h-5 w-5 cursor-pointer"
                                                      onClick={() => setIsEdit(true)}/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Edit Record</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><Trash2 className="h-5 w-5 ml-0 cursor-pointer"
                                                                    onClick={() => setIsDelete(true)}/></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Delete Record</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                </div>
                            }

                            <div className="flex flex-row  relative ">
                                {(isDelete || isEdit) &&
                                    <Button
                                        type="button"
                                        variant={"outline"}
                                        ref={buttonRef}
                                        className={cn("absolute left-0 transition-all duration-200 w-[45%]")}
                                        onClick={() => isDelete ? setIsDelete(false) : setIsEdit(false)}>


                                        Cancel {(isDelete ? "Delete" : "Edit")}
                                    </Button>
                                }
                                <Button
                                    className={cn((isDelete || isEdit) ? "w-1/2 left-1/2" : "w-full left-0", "mb-4 absolute transition-all duration-300")}
                                    disabled={isLoading}
                                    // style={{ minWidth: isDelete || isEdit ? "50%" : "100%" }}
                                    type="submit">

                                    {isLoading && <Loader2 className='h-4 w-4 mr-2 animate-spin'/>}
                                    Submit To
                                    {isEdit ? " Edit" : isDelete ? " Delete" : " View"}
                                </Button>
                            </div>
                            <div className="flex-1"></div>
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