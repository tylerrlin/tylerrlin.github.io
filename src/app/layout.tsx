import "./globals.css";
import type { Metadata } from "next";
import { Poppins, Roboto_Mono } from "next/font/google";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import Socials from "@/components/Socials";
import Scroll from "@/components/Scroll";

const poppins = Poppins({
    subsets: ["latin"],
    weight: "500",
    display: "swap",
    variable: "--font-poppins",
});

const robotoMono = Roboto_Mono({
    subsets: ["latin"],
    weight: "400",
    display: "swap",
    variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
    title: "tylerrlin.github.io",
    description: "My Personal Website - Built with NextJS 13",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className="scroll-smooth"
            style={{ scrollBehavior: "smooth" }}
        >
            <head></head>
            <body
                className={`${poppins.variable} ${robotoMono.variable}`}
                style={{
                    backgroundColor: "rgb(0,0,0)",
                    color: "rgb(255,255,255)",
                }}
            >
                {children}
                <Socials />
                <Scroll />
            </body>
        </html>
    );
}
