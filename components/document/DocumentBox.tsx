"use client"
import React, {useEffect, useState} from "react";
import {Document} from "./DocumentsTable"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger

} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {toast} from "sonner"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import {Button, buttonVariants} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import qs from "query-string";
import {AlertCircle, Edit, Eye, Loader2, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import {decryptReq, encryptReq} from "@/lib/encryption";
import {Category} from "@prisma/client";
import {SearchableSelect} from "../SearchableSelect";
import PasswordInput from "@/components/PasswordInput";

import {Input} from "@/components/ui/input";
import {FileUpload} from "@/components/FileUpload";

const formSchema = z.object({
    password: z.string().min(8, "Password Is required"),
    document: z.string(),
    category: z.string()
});


interface Props {
    categories: Category[]
    documentObj: Document
    onSubmitChange: () => void
}

export const DocumentBox = ({categories, documentObj, onSubmitChange}: Props) => {
    const [isOpen, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [message, setMessage] = useState("");
    const [focusItem, setFocusItem] = useState("");


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            document: "",
            category: documentObj.category.name
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {

        try {
            const encryptPassword = encryptReq(values.password, values.password);
            if (isEdit) {
                if (values.document.length < 1) {
                    form.setError("document", {message: "Document is Required"});
                    form.setFocus("document");
                    return
                }
                // console.log(values.category);

                const data = {
                    id: documentObj.id,
                    password: encryptPassword,
                    document: encryptReq(values.password, values.document),
                    category: values.category
                }
                setMessage("Saving data...")
                await axios.put("api/document", data);
                setMessage("")
                onSubmitChange();
                form.reset();
                setIsEdit(false);
                toast("Value Updated")
            } else if (isDelete) {

                const url = qs.stringifyUrl({
                    url: "/api/document",
                    query: {
                        id: documentObj.id,
                        password: encryptPassword
                    }
                });
                setMessage("Deleting data...")
                await axios.delete(url);
                setMessage("");
                onSubmitChange();
                form.reset();
                setOpen(false);
                toast("Data Deleted")
            } else {
                const data = {
                    id: documentObj.id,
                    password: encryptPassword
                }
                setMessage("Retrieving data...")
                const response = (await axios.post("/api/document", data)).data.value;

                const link = document.createElement('a');
                link.href = decryptReq(values.password, response);
                link.download = decryptReq(values.password, response);
                link.target = "_blank"
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setMessage("");
                form.reset();
            }

        } catch (error) {
            //@ts-ignore
            toast(<><AlertCircle className="h-4 w-4"/>{error.response.data}</>)
            // console.error(error)
            setMessage("")
        }
    };

    useEffect(() => {
        form.setFocus("password")
    }, [])


    useEffect(() => {
        if (isEdit || isDelete)
            if (isEdit) {
                form.setFocus("document");
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
        setOpen(!isOpen);
        setIsEdit(false);
        setIsDelete(false);
        onSubmitChange();
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleOnClose}>
            <DialogTrigger className={cn(buttonVariants({variant: "link"}), "m-0")}>
                <Eye className="h-5 w-5 text-gray-500"/>
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
                            <Label>Document Name:</Label>
                            <span
                                className="w-full  rounded-xl p-2 font-semibold max-w-[450px] overflow-auto bg-slate-200 cursor-text">{documentObj.name}</span>
                        </div>
                        {!isEdit && !isDelete &&
                            <div className="flex-col flex gap-2 mt-4">

                                <div className="flex-col flex gap-2 ">
                                    <Label>Category:</Label>
                                    <span className="p-2">{documentObj.category.name}</span>
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
                                        name={"document"}
                                        control={form.control}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Document:</FormLabel>
                                                <FormControl>
                                                    <FileUpload

                                                        onChange={field.onChange} value={field.value}/>
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