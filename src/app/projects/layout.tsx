import HomeButton from "@/components/HomeButton";
import Home from "../page";

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <HomeButton />
            {children}
        </div>
    );
}
