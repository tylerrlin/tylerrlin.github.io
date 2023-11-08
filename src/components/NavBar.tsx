"use client";

import React from "react";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";

const NavBar = () => {
    const { scrollY } = useScroll();
    const [active, setActive] = React.useState(false);
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 600) {
            setActive(true);
        } else {
            setActive(false);
        }
    });

    const sections = [
        {
            name: "HOME.",
            link: "#home",
        },
        {
            name: "SKILLS.",
            link: "#skills",
        },
        {
            name: "PROJECTS.",
            link: "#projects",
        },
        {
            name: "ABOUT.",
            link: "#about",
        },
        {
            name: "CONTACT.",
            link: "#contact",
        },
    ];

    return (
        <div
            className="flex fixed w-screen h-14 top-0 z-20 justify-center duration-300"
            style={{
                transform: `translateY(${active ? "0" : "-100%"})`,
            }}
        >
            <ul className="w-full h-full flex md:w-2/3 lg:w-1/2">
                {sections.map((data, index) => {
                    return (
                        <Link
                            key={index}
                            href={data.link}
                            className="flex w-1/5 text-xs h-full border-2 justify-center items-center opacity-40 hover:opacity-100 hover:border-black hover:!bg-left hover:text-black cursor-pointer sm:text-base"
                            style={{
                                background:
                                    "linear-gradient(to left, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 1) 50%) right",
                                backgroundSize: "200% 100%",
                                transition:
                                    "background-position 0.2s ease-in-out, border 0.2s ease-in-out, color 0.2s ease-in-out",
                            }}
                        >
                            {data.name}
                        </Link>
                    );
                })}
            </ul>
        </div>
    );
};

export default NavBar;
