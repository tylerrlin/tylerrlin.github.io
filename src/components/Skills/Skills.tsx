"use client";

import React from "react";
import Link from "next/link";

import { motion } from "framer-motion";

import { faReact } from "@fortawesome/free-brands-svg-icons";
import { faLaptopCode, faCloud } from "@fortawesome/free-solid-svg-icons";

import SkillsItem from "./SkillsItem";

const Skills = () => {
    return (
        <div
            id="skills"
            className="flex flex-col relative w-screen bg-black items-center z-10"
        >
            <motion.h1
                initial={{
                    x: -50,
                    opacity: 0,
                }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                viewport={{ margin: "-100px" }}
                className="font-poppins text-5xl text-center mt-32 lg:text-6xl tracking-widest"
            >
                SKILLS.
            </motion.h1>
            <ul className="flex flex-col mt-20 justify-center items-center gap-2 w-2/3 lg:flex-row">
                <SkillsItem id={0} icon={faReact} title="FRONT-END DEVELOPMENT">
                    <h3>
                        Passion for design and functionality. Experienced in
                        HTML, CSS, Javascript, React, NextJS, Tailwind.
                    </h3>
                </SkillsItem>
                <SkillsItem
                    id={1}
                    icon={faLaptopCode}
                    title="SOFTWARE DEVELOPMENT"
                >
                    <h3>
                        Strong foundation in both{" "}
                        <span className="text-green-light">functional</span> and{" "}
                        <span className="text-green-light">
                            object-oriented
                        </span>{" "}
                        programming languages: Python, Java, Javascript, C++.
                    </h3>
                </SkillsItem>
                <SkillsItem id={2} icon={faCloud} title="GOOGLE CLOUD PLATFORM">
                    <h3>
                        <Link
                            href="https://www.credential.net/0370642f-ed3f-46bd-8719-02ab1cbdc219?key=2fdfcbb23951458a638fb5c91835cad7df5b2c6d5926a31d53d74c9fb00db011"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <span className="text-green-light underline">
                                Cloud Digital Leader
                            </span>
                        </Link>
                        : Knowledgeable in App Engine, Firestore, Pub/Sub,
                        Monitoring, Functions.
                    </h3>
                </SkillsItem>
            </ul>
        </div>
    );
};

export default Skills;
