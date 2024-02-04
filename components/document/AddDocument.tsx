"use client"

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import {Button, buttonVariants} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {FileUpload} from "@/components/FileUpload";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import {useEffect, useState} from "react";
import {AlertCircle, Loader2, PlusCircle} from "lucide-react";

import {cn} from "@/lib/utils";
import {toast} from "sonner";
import {encryptReq} from "@/lib/encryption";
import {Category} from "@prisma/client";
import {SearchableSelect} from "@/components/SearchableSelect";
import PasswordInput from "@/components/PasswordInput";

const formSchema = z.object({

    name: z.string().min(1, "Document Name is required"),
    document: z.string().min(1, "Document is required"),
    password: z.string().min(8, "Password Should be minimum of length 8"),
    category: z.string(),
});

const AddDocument = ({onSubmitChange}: { onSubmitChange: () => void }) => {
    const [isOpen, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [focusItem, setFocusItem] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            document: "",
            password: "",
            category: ""
        }
    });
    const isLoading = form.formState.isSubmitting;

    const handleFileChange = (e) => {
        form.setValue("document", e.target.files[0]);
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {

            const encryptedPassword = encryptReq(values.password, values.password);
            const encryptedValue = encryptReq(values.password, values.document);
            const data = {
                name: values.name,
                document: encryptedValue,
                password: encryptedPassword,
                category: values.category
            }
            setMessage("Saving data...")
            await axios.post("/api/document/addDocument", data);

            setMessage("")
            toast("Record Added");
            onSubmitChange();
            await getCategories();
            setOpen(false);
            form.reset()
        } catch (error: any) {
            if (error.response) {
                if (error.response.data === "Password Incorrect") {
                    form.setFocus("password");
                }
                toast(<><AlertCircle className="h-4 w-4"/>{error.response.data}</>)
            }
            setMessage("")
            console.error(error)
        }
    };
    const [categories, setCategories] = useState<Category[]>([]);

    const getCategories = async () => {
        const response = await axios.get("/api/category");
        setCategories(response.data.categories);
    }
    useEffect(() => {
        getCategories().then();
    }, [])

    const handleDialogClose = () => {
        setOpen(!isOpen);
        form.reset();
    }
    const handleFocusChange = (event) => {
        // console.log(event.target.id)
        if (event.target.id.includes("react-select")) {
            setFocusItem(true);
        } else {
            if (focusItem) {
                form.setFocus("password");

            }
            setFocusItem(false);
        }
    }
    // @ts-ignore
    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger className={cn(buttonVariants({variant: "default"}), "gap-2 flex w-full md:w-1/3")}>
                <><PlusCircle className="min-h-3 min-w-3"/> <span>Securely Add One</span></>
            </DialogTrigger>
            <DialogContent onFocusCapture={handleFocusChange}>
                <DialogHeader>
                    <DialogTitle>
                        Add A Document
                    </DialogTitle>
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                disabled={isLoading}
                                name={"name"}
                                control={form.control}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Document Name:</FormLabel>
                                        <FormControl>
                                            <Input
                                                autoFocus
                                                disabled={isLoading}
                                                placeholder="Enter Name"
                                                {...field}
                                                // type={"password"}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                                }/>
                            <FormField
                                control={form.control}
                                name="document"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                name={"category"}
                                control={form.control}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Category:</FormLabel>
                                        <FormControl>
                                            <SearchableSelect inputOptions={categories.map(cat => cat.name)}
                                                              onSelect={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                                }/>
                            <FormField
                                disabled={isLoading}
                                name={"password"}
                                control={form.control}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password :</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                disabled={isLoading}
                                                placeholder="Enter Password set after Login"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                                }/>


                            <div className="flex flex-col space-y-1.5 pt-2">
                                <Button disabled={isLoading} type="submit">{isLoading &&
                                    <Loader2 className='h-4 w-4 animate-spin mr-2'/>}Submit</Button>
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
export default AddDocument;