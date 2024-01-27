"use client"
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl, FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import axios from "axios";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {Progress} from "@/components/ui/progress";
import { encryptReq } from '@/lib/encryption';
import { toast } from 'sonner';


const formSchema = z.object({

    password: z.string().min(8, "Password is Required with minimum length of 8"),
    confirmPassword: z.string().min(8, "Confirm Password Is required with minimum length of 8")
});

export default function SignUpComponent() {
    const [validate, setValidate] = useState({
        hasLow: false,
        hasCap: false,
        hasNumber: false,
        has8digit: false,
        hasSymbol: false
    });


    const strength = Object.values(validate).reduce((a, item) => a + (item ? 1 : 0), 0);

    const feedback = {
        1: "Password is to weak!",
        2: "It's still weak! ",
        3: "You are getting better!",
        4: "You almost there!",
        5: "Great!! now your password is strong"
    }[strength];
    const validatePassword = (password: string) => {
        if (password.match(/\d+/g)) {
            setValidate((o) => ({...o, hasNumber: true}));
        } else {
            setValidate((o) => ({...o, hasNumber: false}));
        }

        if (password.match(/[A-Z]+/g)) {
            setValidate((o) => ({...o, hasCap: true}));
        } else {
            setValidate((o) => ({...o, hasCap: false}));
        }

        if (password.match(/[a-z]+/g)) {
            setValidate((o) => ({...o, hasLow: true}));
        } else {
            setValidate((o) => ({...o, hasLow: false}));
        }

        if (password.length > 7) {
            setValidate((o) => ({...o, has8digit: true}));
        } else {
            setValidate((o) => ({...o, has8digit: false}));
        }
        if (password.match(/[^a-zA-Z0-9]+/g)) {
            setValidate((o) => ({...o, hasSymbol: true}));
        } else {
            setValidate((o) => ({...o, hasSymbol: false}));
        }

    };

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });
    const isLoading = form.formState.isSubmitting;
    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {

            if (values.password !== values.confirmPassword) {
                form.setError("confirmPassword", {message: "Passwords Need to match"})
                form.setError("password", {message: "Passwords Need to match"})
                form.setFocus("password");
                return;
            }
            if (strength < 5) {
                form.setError("password", {message: "Password is weak"})
                form.setError("confirmPassword", {message: "Password is weak"})
                form.setFocus("password");
                return;
            }
            await axios.post("/api/saveUser", {viewPassword:encryptReq(values.password, values.password)});
            form.reset()
            toast("Password Saved")
            router.push('/');
        } catch (error) {
            console.error(error)
        }
    };

    useEffect(() => {
        if (!isLoading) {
            const timer = setInterval(() => {
                validatePassword(form.getValues("password"))
            }, 500)
            return () => clearInterval(timer)
        }
    })

    return (
        <div className={"w-full h-screen flex justify-center items-center"}>
            <Card className="w-1/3  ">
                <CardHeader>
                    <CardTitle>Set Password</CardTitle>
                    <CardDescription>This password is used for accessing the documents and passwords stored. <strong>This
                        is different from the login password</strong></CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            <FormField
                                disabled={isLoading}
                                name={"confirmPassword"}
                                control={form.control}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password:</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Re Enter Password"
                                                {...field}
                                                type={"password"}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                                }/>
                            {strength > 0  &&
                                <Progress value={strength / 5 * 100}/>
                            }
                            <span className={"text-sm text-center mt-2"}>{feedback}</span>

                            <div className="flex flex-col space-y-1.5 pt-2">
                                <Button disabled={isLoading} type="submit">Sign Up</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>

            </Card>
        </div>
    );
}
