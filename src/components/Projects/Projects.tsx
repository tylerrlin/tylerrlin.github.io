"use client";

import React from "react";

import { motion } from "framer-motion";

import ProjectData from "./ProjectData";
import ProjectItem from "./ProjectItem";

import Underline from "@/components/Underline";

const Projects = () => {
    return (
        <div
            id="projects"
            className="flex flex-col relative w-screen bg-black items-center"
        >
            <motion.span
                initial={{
                    x: -50,
                    opacity: 0,
                }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                viewport={{ margin: "-100px" }}
                className="font-poppins text-4xl text-center mt-56 lg:text-5xl tracking-widest"
            >
                PROJECTS.
            </motion.span>
            <Underline widthPercent={40} marginTop="40px" />
            <div className="mt-32 flex flex-col w-2/3 gap-32">
                {ProjectData.map((project, index) => (
                    <ProjectItem
                        key={index}
                        id={index}
                        image={project.image}
                        title={project.title}
                        description={project.description}
                        github={project.github}
                        deployed={project.deployed}
                        skills={project.skills}
                    />
                ))}
            </div>
        </div>
    );
};

export default Projects;
