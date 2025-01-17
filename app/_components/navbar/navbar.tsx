"use client";

import { useRouter } from "next/navigation";

import { SignedIn } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { useIsMobile } from "@/hooks/use-is-mobile";

import { SiteSymbol } from "./site-symbol";
import { UserStatus } from "./user-status";


export const Navbar = () => {
    // const [isVisible, setIsVisible] = useState(true);
    // const [lastScrollY, setLastScrollY] = useState(0);

    const isMobile = useIsMobile();

    const router = useRouter()

    // useEffect(() => {
    //     const handleScroll = () => {
    //         const currentScrollY = window.scrollY;
    //         if (currentScrollY > lastScrollY && currentScrollY > 50) {
    //             setIsVisible(false);
    //         } else {
    //             setIsVisible(true);
    //         }
    //         setLastScrollY(currentScrollY);
    //     }

    //     window.addEventListener("scroll", handleScroll);

    //     return () => {
    //         window.removeEventListener("scroll", handleScroll);
    //     };

    // }, [lastScrollY]);

    const handleNewPostClick = () => {
        router.push("/new-post")
    }

    return (
        <div className={cn("px-4 flex jb items-center justify-between fixed top-0 left-0 w-full transition-transform duration-300 border-b-2 z-50",
            // isVisible ? "translate-y-0" : "-translate-y-full",
            isMobile ? "h-14" : "h-20",
            "h-16" // fixed height now, no fading away
        )}>
            <SiteSymbol isMobile={isMobile} onClick={() => router.push('/')} />
            <div className="flex gap-4 items-center justify-center">
                <UserStatus />
                <SignedIn>
                    <Button onClick={handleNewPostClick}>
                        New Post +
                    </Button>
                </SignedIn>
            </div>
        </div>
    );
}

