import React from "react";

import Image from "next/image";
import Link from "next/link";

import { ProjectDataProps } from "./ProjectData";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import { motion } from "framer-motion";

interface ProjectItemProps extends ProjectDataProps {
    id: number;
}

const ProjectItem = (props: ProjectItemProps) => {
    const left = props.id % 2 === 0;

    const projectInfoContainer = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: 0.2,
            },
        },
    };
    const projectInfoAnimate = {
        hidden: { opacity: 0, x: left ? -50 : 50 },
        show: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <div
            className={`relative flex flex-row duration-100 ${
                left ? "flex-row-reverse" : ""
            }`}
            style={{
                minHeight: "30vw",
            }}
        >
            <motion.div
                className="hidden absolute w-2/3 h-full rounded-lg overflow-hidden lg:flex"
                initial={{
                    y: 100,
                    opacity: 0,
                }}
                whileInView={{
                    y: 0,
                    opacity: 1,
                    transition: {
                        duration: 0.7,
                        delay: 0.3,
                    },
                }}
                whileHover={{
                    scale: 1.05,
                }}
            >
                <Link
                    href={props.deployed}
                    rel="noopener noreferrer"
                    className="relative w-full h-full"
                >
                    <Image
                        className="object-cover object-left"
                        alt=""
                        src={props.image}
                        quality={100}
                        fill
                        priority
                        sizes="100%"
                    />
                    <div
                        className="absolute w-full h-full hover:opacity-0 duration-300"
                        style={{
                            background: "rgba(190, 255, 190, 0.4)",
                        }}
                    ></div>
                </Link>
            </motion.div>
            <motion.div
                className={`mt-8 flex flex-col relative h-full justify-start items-start gap-4 pointer-events-none xl:gap-6 ${
                    left
                        ? "items-start text-left left-0"
                        : "items-end text-right right-0"
                }`}
                initial="hidden"
                whileInView="show"
                viewport={{ margin: "-100px" }}
                variants={projectInfoContainer}
            >
                <motion.h2
                    className="text-green-light font-poppins text-sm font-semibold tracking-widest xl:text-lg"
                    variants={projectInfoAnimate}
                >
                    {`PROJECT ${props.id + 1 < 10 ? "0" : ""}${props.id + 1}.`}
                </motion.h2>
                <motion.h2
                    className="text-white font-poppins font-bold tracking-widest text-xl xl:text-2xl"
                    variants={projectInfoAnimate}
                >
                    {props.title}
                </motion.h2>
                <motion.div
                    className="font-roboto text-sm w-full bg-green-dark rounded-lg p-4 lg:w-2/3 xl:w-2/5"
                    variants={projectInfoAnimate}
                >
                    <h3>{props.description}</h3>
                </motion.div>
                <motion.div
                    className={`flex flex-row gap-5 text-green-light text-xs font-poppins font-medium`}
                    variants={projectInfoAnimate}
                >
                    {props.skills.map((skill, index) => (
                        <div key={index}>{skill}</div>
                    ))}
                </motion.div>
                <motion.div
                    className={`flex flex-row text-white gap-8 text-lg xl:text-2xl ${
                        left ? "justify-start" : "justify-end"
                    }`}
                    variants={projectInfoAnimate}
                >
                    <Link
                        href={props.github}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="pointer-events-auto opacity-50 hover:opacity-100 hover:-translate-y-1 duration-300"
                    >
                        <FontAwesomeIcon className="" icon={faGithub} />
                    </Link>
                    <Link
                        href={props.deployed}
                        rel="noopener noreferrer"
                        className="pointer-events-auto opacity-50 hover:opacity-100 hover:-translate-y-1 duration-300"
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ProjectItem;
