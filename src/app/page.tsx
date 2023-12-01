"use client";

import React from "react";

import { motion } from "framer-motion";

import Header from "@/components/Header/Header";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import About from "@/components/About/About";
import Contact from "@/components/Contact/Contact";

import NavBar from "@/components/NavBar";

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        >
            <Header />
            <Skills />
            <Projects />
            <About />
            <Contact />
            <NavBar />
        </motion.div>
    );
};

export default Home;
