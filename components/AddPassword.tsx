"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { PlusCircle, AlertCircle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { encryptReq } from "@/lib/encryption";
import { Category } from "@prisma/client";

const formSchema = z.object({

    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
    password: z.string().min(8, "Password Should be minimum of length 8"),
    category: z.string(),
});

const AddPassword = ({ onSubmitChange }: { onSubmitChange: () => void }) => {
    const [isOpen, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            key: "",
            value: "",
            password: "",
            category: ""
        }
    });
    const isLoading = form.formState.isSubmitting;
    const handlePreSubmit = async (password: string, value: string) => {
        setMessage("Encrypting Data...")
        const encryptedValue = encryptReq(password, value);
        const encryptedPassword = encryptReq(password, password);
        return { encryptedValue, encryptedPassword };
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const { encryptedValue, encryptedPassword } = await handlePreSubmit(values.password, values.value)
            const data = {
                key: values.key,
                value: encryptedValue,
                password: encryptedPassword,
                category: values.category
            }
            setMessage("Saving data...")
            await axios.post("/api/addPassword", data);
            setMessage("")
            toast("Record Added");
            onSubmitChange();
            setOpen(false);
            form.reset()
        } catch (error: any) {
            if (error.response) {
                if (error.response.data === "Password Incorrect") {
                    form.setFocus("password");
                }
                toast(<><AlertCircle className="h-4 w-4" />{error.response.data}</>)
            }
            setMessage("")
            // console.error(error)
        }
    };
    const [categories, setCategories] = useState<Category[]>([]);

    const getCategories = async () => {
        const response = await axios.get("/api/category");
        setCategories(response.data.categories);
    }
    useEffect(() => {
        getCategories();
    }, [])
    return (
        <Dialog open={isOpen} onOpenChange={() => setOpen(!isOpen)}>
            <DialogTrigger className={cn(buttonVariants({ variant: "default" }), "gap-2 flex w-full md:w-1/3")}>
                <><PlusCircle className="h-5 w-5"/> <span>Securely Add One</span></>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add A Password
                    </DialogTitle>
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                disabled={isLoading}
                                name={"key"}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Key:</FormLabel>
                                        <FormControl>
                                            <Input

                                                disabled={isLoading}
                                                placeholder="Enter Key"
                                                {...field}
                                            // type={"password"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                                } />
                            <FormField
                                disabled={isLoading}
                                name={"value"}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value:</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Value"
                                                {...field}
                                                type={"password"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                                } />
                            <FormField
                                disabled={isLoading}
                                name={"category"}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category:</FormLabel>
                                        <FormControl>
                                            <>
                                            <Input type="text" list="cars" placeholder="Category" onChange={field.onChange} disabled={isLoading} />
                                            <datalist id="cars" className="w-full bg-transparent" >
                                                {categories.map((cat, index) => (
                                                    <option>{cat.name}</option>
                                                ))}
                                            </datalist>
                                            </>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                                } />
                            <FormField
                                disabled={isLoading}
                                name={"password"}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password:</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Enter Password"
                                                {...field}
                                                type={"password"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                                } />


                            <div className="flex flex-col space-y-1.5 pt-2">
                                <Button disabled={isLoading} type="submit">{isLoading && <Loader2 className='h-4 w-4 animate-spin mr-2' />}Submit</Button>
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
export default AddPassword;