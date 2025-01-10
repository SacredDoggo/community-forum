import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-y-4">
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
            <Button asChild>
                <Link href="/">Return Home</Link>
            </Button>
        </div>
    )
}