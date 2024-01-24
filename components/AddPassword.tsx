"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Button, buttonVariants} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import {useState} from "react";

const formSchema = z.object({

    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
    password: z.string().min(8, "Password Is required")
});

const AddPassword = () => {
    const [isOpen, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            key: "",
            value: "",
            password: ""
        }
    });
    const isLoading = form.formState.isSubmitting;
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {


            await axios.post("/api/password", values);
            setOpen(false);
            form.reset()
        } catch (error) {
            // @ts-ignore
            if (error.response.data === "Password Incorrect"){
                form.setError("password", {message:"Incorrect Password"});
            }
            console.error(error)
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={()=>setOpen(!isOpen)}>
            <DialogTrigger className={buttonVariants({variant: "default"})}>
                Securely Add One
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
                            render={({field}) => (
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
                                    <FormMessage/>
                                </FormItem>
                            )
                            }/>
                        <FormField
                            disabled={isLoading}
                            name={"value"}
                            control={form.control}
                            render={({field}) => (
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
                                    <FormLabel>Password:</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Enter Password"
                                            {...field}
                                            type={"password"}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                            }/>


                        <div className="flex flex-col space-y-1.5 pt-2">
                            <Button disabled={isLoading} type="submit">Submit</Button>
                        </div>
                    </form>
                </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
export default AddPassword;