"use client";

import React from "react";
import Image from "next/image";

import { motion, useScroll, easeInOut } from "framer-motion";

import ParallaxLayer from "./ParallaxLayer";
import HeaderNav from "./HeaderNav";

const Header = () => {
    const { scrollY } = useScroll();
    const name = "TYLERLIN.";
    return (
        <div id="home" className="relative bg-green w-screen h-screen z-0">
            <ParallaxLayer id={0} src="/Parallax1.png" scroll={scrollY} />
            <ParallaxLayer id={1} src="/Parallax2.png" scroll={scrollY} />
            <ParallaxLayer id={2} src="/Parallax3.png" scroll={scrollY} />
            <div className="w-screen h-screen fixed flex flex-col justify-center items-center text-center lg:text-left lg:items-start">
                <div className="flex font-poppins text-4xl md:text-6xl tracking-widest font-bold mb-5 lg:text-7xl lg:mb-8 lg:ml-48">
                    {name.split("").map((letter, index) => {
                        return (
                            <motion.h1
                                className={`w-min ${index === 4 ? "mr-6" : ""}`}
                                key={index}
                                animate={{
                                    y: [0, -10, 0],
                                    color: ["#ffffff", "#557955", "#ffffff"],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    repeatDelay: 5,
                                    duration: 1,
                                    delay: index * 0.2,
                                    ease: easeInOut,
                                }}
                            >
                                {letter}
                            </motion.h1>
                        );
                    })}
                </div>
                <motion.h2
                    animate={{ x: [-100, 0], opacity: [0, 1] }}
                    transition={{
                        duration: 0.5,
                        ease: easeInOut,
                    }}
                    className="font-roboto opacity-0 text-xl tracking-tight mb-10 lg:text-2xl lg:mb-6 lg:ml-64"
                >
                    STUDENT AND ASPIRING SOFTWARE ENGINEER.
                </motion.h2>
                <HeaderNav />
            </div>
            <Image
                className="object-cover object-center-bottom w-full h-full pointer-events-none"
                alt=""
                quality={100}
                priority={true}
                src="/Parallax4.png"
                fill
            />
        </div>
    );
};

export default Header;
