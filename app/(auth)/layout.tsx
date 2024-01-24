import React from "react";

const AuthLayout = ({children} : {children: React.ReactNode}) => {
    return (
        <div className="h-screen flex items-center justify-center">
            <div className={"absolute top-0 right-0 p-2"}>

            </div>
            {children}
        </div>
    );
}

export default AuthLayout;