import { LeftSideBar } from "../_components/left-sidebar/leftsidebar";
import { Navbar } from "../_components/navbar/navbar";
import { RightSideBar } from "../_components/right-sidebar/right-sidebar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full w-full">
            <Navbar />
            <LeftSideBar />
            <div className="mt-16 px-4 flex-1 overflow-auto">
                {children}
            </div>
            <RightSideBar />
        </div>
    );
}
