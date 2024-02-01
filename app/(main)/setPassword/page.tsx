import { ResetPassword } from '@/components/ResetPassword';
import { SignUpComponent } from '@/components/SignUpComponent';
import { currentProfile } from '@/lib/current-profile';



export default async function SignUpPage() {
    const user = await currentProfile();
  

    return (
        <div className={"w-full h-screen flex justify-center items-center"}>
            {!user ?
                <SignUpComponent />
                : 
                <ResetPassword date={user.updatedAt}/>
            }

        </div>
    );
}
