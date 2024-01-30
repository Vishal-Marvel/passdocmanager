import React from "react";

const AuthLayout = ({children} : {children: React.ReactNode}) => {
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <div className={"p-2 mt-4 font-bold text-2xl text-center"}>
                <span>Sign in To Continue to PASSWORD and DOCUMENT manager</span>
            </div>
            {children}
        </div>
    );
}

export default AuthLayout;