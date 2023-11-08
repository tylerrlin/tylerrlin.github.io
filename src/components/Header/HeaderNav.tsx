import React from "react";

import { motion } from "framer-motion";
import Link from "next/link";

const HeaderNav = () => {
    const sections = [
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
        <motion.ul
            animate={{
                y: [70, 0],
                opacity: [0, 1],
            }}
            transition={{
                duration: 0.5,
                delay: 0.25,
            }}
            className="flex opacity-0 font-roboto text-l mb-5 flex-col lg:text-l lg:mb-8 lg:ml-64 lg:flex-row"
        >
            {sections.map((data, index) => {
                return (
                    <Link key={index} href={data.link}>
                        <li
                            className="flex w-44 h-14 border-2 leading-10 justify-center items-center text-center lg:w-32 lg:h-12 hover:border-black hover:!bg-left hover:text-black cursor-pointer"
                            style={{
                                background:
                                    "linear-gradient(to left, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 1) 50%) right",
                                backgroundSize: "200% 100%",
                                transition:
                                    "background-position 0.2s ease-in-out, border 0.2s ease-in-out, color 0.2s ease-in-out",
                            }}
                        >
                            {data.name}
                        </li>
                    </Link>
                );
            })}
        </motion.ul>
    );
};

export default HeaderNav;
