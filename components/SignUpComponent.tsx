"use client"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { encryptReq } from '@/lib/encryption';
import { toast } from 'sonner';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import {cn} from '@/lib/utils';
import {PasswordInput} from "@/components/PasswordInput";

const formSchema = z.object({

    password: z.string().min(8, "Password is Required with minimum length of 8"),
    confirmPassword: z.string().min(8, "Confirm Password Is required with minimum length of 8")
});


export const SignUpComponent = () => {
    const [isConfirmSame, setIsConfirmState] = useState(false);

    const [requirementList, setRequirementList] = useState([
        { regex: /.{8,}/, text: "Minimum of 8 characters", state: false },
        { regex: /[0-9]/, text: "At least one number", state: false },
        { regex: /[a-z]/, text: "At least one lowercase letter", state: false },
        { regex: /[^A-Za-z0-9]/, text: "At least one special character", state: false },
        { regex: /[A-Z]/, text: "At least one uppercase letter", state: false },
    ]);


    // const strength = Object.values(validate).reduce((a, item) => a + (item ? 1 : 0), 0);
    const strength = requirementList.filter(item => item.state).length + (isConfirmSame ? 1 : 0);


    const feedback = {
        1: "Password is to weak!",
        2: "It's still weak! ",
        3: "You are getting better!",
        4: "You almost there!",
        5: "Great!! now your password is strong"
    }[!isConfirmSame ? strength : strength - 1];

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
            const encryptData = await encryptReq(values.password, values.confirmPassword);
            const response = await axios.post("/api/saveUser", { viewPassword: encryptData });
            router.push('/');
            form.reset()
            toast(response.data)

        } catch (error) {
            toast(<><AlertCircle />{error.response.data}</>)
            if (error.response.data === "Password Already Set") {
                // console.log("tt")
                router.push('/');

            }
            console.error(error)
        }
    };



    useEffect(() => {
        const handleEvent = () => {
            const value = form.getValues("password");

            // console.log("event")
            requirementList.forEach((item, index) => {
                const isValid = item.regex.test(value);
                if (isValid) {
                    const newList = [...requirementList];
                    newList[index].state = true;
                    setRequirementList(newList);
                } else {
                    const newList = [...requirementList];
                    newList[index].state = false;
                    setRequirementList(newList);

                }
            })
            const sortedRequirementList = [...requirementList].sort((a, b) => {
                // Sort in ascending order if state is true, and descending if state is false
                return a.state === b.state ? 0 : a.state ? 1 : -1;
            });
            setRequirementList(sortedRequirementList);

            const passwordValue = form.getValues("password");
            const confirmValue = form.getValues("confirmPassword")

            // console.log("event")
            if (passwordValue !== "" && passwordValue === confirmValue) {
                setIsConfirmState(true);
            } else {
                setIsConfirmState(false);
            }
        }

        const timer = setInterval(handleEvent, 500)
        return () => clearInterval(timer);

    }, [])


    return (
        <Card className="lg:w-1/3 md:w-2/4 w-4/5">
            <CardHeader>
                <CardTitle>Set Password</CardTitle>
                <CardDescription>
                    
                        This password is used for accessing the documents and passwords stored. <strong>This
                            is different from the login password</strong>
                        
                    
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            disabled={isLoading}
                            name={"password"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password:</FormLabel>
                                    <FormControl>
                                        <PasswordInput

                                            disabled={isLoading}
                                            placeholder="Enter Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                            } />
                        <FormField
                            disabled={isLoading}
                            name={"confirmPassword"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password:</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            disabled={isLoading}
                                            placeholder="Re Enter Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                            }/>
                        <div className={"space-y-2"}>
                            {!isLoading && strength > 0 && (!isConfirmSame ? strength : strength - 1) < 5 &&
                                <div className={"space-y-4"}>
                                    <Progress value={(!isConfirmSame ? strength : strength - 1) / 5 * 100}/>
                                    <span className={"text-sm text-center mt-2"}>{feedback}</span>


                                    <div className='grid grid-cols-1 gap-1'>
                                        {requirementList.map((req, index) => (
                                            <span key={index}
                                                  className={cn("text-sm flex m-0 items-center gap-2 transition-all duration-400 ease-in", req.state ? "text-gray-600 line-through" : "text-black font-semibold")}>{req.state ?
                                                <Check className="h-4 w-4 m-0 text-inherit"/> :
                                                <X className="h-4 w-4 m-0 text-inherit"/>} {req.text}</span>
                                        ))}

                                    </div>
                                </div>
                            }
                            {!isLoading && strength > 0 && !isConfirmSame &&
                                <span
                                    className={cn("text-sm flex m-0 items-center gap-2 transition-all duration-400 ease-in", isConfirmSame ? "text-gray-600 line-through" : "text-black font-semibold")}>{isConfirmSame ?
                                    <Check className="h-4 w-4 m-0 text-inherit"/> :
                                    <X className="h-4 w-4 m-0 text-inherit"/>} Both Password And Confirm Password must be same</span>
                            }
                            {!isLoading && strength === 6 &&
                                <span className={cn("text-sm flex m-0 gap-2 items-center text-gray-600")}><Check
                                    className="h-4 w-4 m-0 text-inherit"/>  All Conditions Satisfied</span>
                            }
                        </div>

                        <div className="flex flex-col space-y-1.5 pt-2">
                            <Button disabled={isLoading || (strength < 6)} type="submit">{isLoading && <Loader2 className='h-4 w-4 animate-spin mr-2' />}Sign Up</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>

        </Card>
    )

}