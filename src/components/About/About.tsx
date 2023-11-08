"use client";

import React from "react";

import Image from "next/image";
import { motion } from "framer-motion";

import Underline from "@/components/Underline";

const About = () => {
    return (
        <div
            id="about"
            className="pt-52 pb-36 w-full flex flex-row relative gap-20 justify-center items-center bg-black"
        >
            <motion.div className="w-2/3 flex flex-col text-center justify-center items-center xl:w-2/5">
                <motion.h1
                    className="font-poppins text-5xl lg:text-6xl xl:text-5xl tracking-widest"
                    initial={{
                        x: -50,
                        opacity: 0,
                    }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    viewport={{ margin: "-100px" }}
                >
                    ABOUT.
                </motion.h1>
                <Underline widthPercent={60} marginTop="40px" />
                <div className="mt-12 flex flex-col gap-5 text-sm tracking-wide font-roboto lg:text-lg md:text-base">
                    <p className="leading-10">
                        Hi! I&apos;m Tyler, an engineer at Tufts University
                        studying{" "}
                        <span className="text-green-light">
                            Computer Science
                        </span>{" "}
                        and{" "}
                        <span className="text-green-light">
                            Cognitive Brain Science
                        </span>
                    </p>
                    <p className="leading-10">
                        With a passion for puzzles, I thrive on solving
                        challenging problems with creative solutions.
                    </p>
                    <p className="leading-10">
                        Currently seeking{" "}
                        <span className="text-green-light">
                            software engineering internships
                        </span>{" "}
                        for Summer 2024.
                    </p>
                </div>
            </motion.div>
            <div
                className="hidden relative xl:flex justify-center items-center"
                style={{
                    width: "30vw",
                    height: "30vw",
                }}
            >
                <Image
                    src="/about.png"
                    alt=""
                    quality={100}
                    fill
                    priority
                    sizes="100%"
                />
            </div>
        </div>
    );
};

export default About;
