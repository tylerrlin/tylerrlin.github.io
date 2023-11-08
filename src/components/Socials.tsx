"use client";

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faLinkedin,
    faGithubSquare,
    faInstagramSquare,
    IconDefinition,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelopeSquare } from "@fortawesome/free-solid-svg-icons";

import { motion } from "framer-motion";

const Socials = () => {
    const socials: [IconDefinition, string][] = [
        [faLinkedin, "https://www.linkedin.com/in/tylerrlin/"],
        [faGithubSquare, "https://github.com/tylerrlin"],
        [faInstagramSquare, "https://www.instagram.com/tylerrlin/"],
        [faEnvelopeSquare, "mailto:tylerrlin@gmail.com"],
    ];

    return (
        <motion.ul
            animate={{ opacity: [0, 1], y: [100, 0] }}
            transition={{ duration: 0.5, delay: 0 }}
            className="hidden opacity-0 flex-col fixed right-8 bottom-0 gap-4 text-5xl items-center text-white z-20 md:flex"
        >
            {socials.map((social, index) => {
                return (
                    <li
                        key={index}
                        className="opacity-30 duration-500 hover:opacity-100 hover:-translate-y-2 hover:duration-100"
                    >
                        <Link
                            href={social[1]}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <FontAwesomeIcon icon={social[0]} />
                        </Link>
                    </li>
                );
            })}
            <li className="w-1 h-24 bg-white opacity-30"></li>
        </motion.ul>
    );
};

export default Socials;
