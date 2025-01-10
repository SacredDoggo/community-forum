"use client";

import { Button } from "@/components/ui/button";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";


export const UserStatus = () => {
    const { isSignedIn, user, isLoaded } = useUser()
    return (
        <div className="flex gap-2 items-center">
            {isSignedIn && <UserButton /> } 
            {!isSignedIn && isLoaded && (
                <>
                    <SignInButton mode="modal">
                        <Button variant="ghost">
                            Login
                        </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <Button>
                            Sign up
                        </Button>
                    </SignUpButton>
                </>
            )}
        </div>
    );
}