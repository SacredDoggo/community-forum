import { cn } from "@/lib/utils";

interface SiteSymbolProps {
    isMobile: boolean;
    onClick: () => void;
}

export const SiteSymbol = ({ isMobile, onClick }: SiteSymbolProps) => {
    return (
        <div className="h-full flex items-center">
            <h1
                className={cn(
                    "font-mistervampire select-none cursor-pointer",
                    isMobile ? "text-3xl" : "text-5xl",
                    "text-4xl" // fixed height and fixed font size
                )}
                onClick={onClick}
            >
                Announcer
            </h1>
        </div>
    );
}