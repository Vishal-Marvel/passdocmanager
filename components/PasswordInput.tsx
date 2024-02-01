import React, {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Eye, EyeOff} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({placeholder, ...props}, ref) => {
    const [view, setView] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const handleMouseDown = () => {
        if (props.disabled != true) {
            setIsMouseDown(true);
            setView(true);
        }
    }
    const handleMouseUp = () => {
        setIsMouseDown(false);
        setView(false);
    }

    useEffect(() => {
        if (view) {
            const timer = setInterval(handleMouseUp, 800);
            return () => clearInterval(timer);
        }
    }, [view, isMouseDown])

    return (
        <div className={"relative"}>
            <Input
                placeholder={placeholder}

                ref={ref}
                type={view ? "text" : "password"}
                {...props}
            />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className={"absolute right-4 top-[50%] -translate-y-[50%]"} tabIndex={-1}>
                        {isMouseDown ? (

                            <EyeOff
                                className="text-gray-600 h-5 cursor-pointer w-5 "
                                onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchCancel={handleMouseUp}
                                onTouchEnd={handleMouseUp} onTouchMove={handleMouseUp}
                            />
                        ) : (
                            <Eye
                                className="text-gray-600 h-5 cursor-pointer w-5 "
                                onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}
                            />
                        )}
                    </TooltipTrigger>
                    <TooltipContent>

                        <p>View Password</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </div>
    )
});

export default PasswordInput