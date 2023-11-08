"use client";

import React from "react";

import { motion, useScroll } from "framer-motion";

const Scroll = () => {
    const { scrollYProgress } = useScroll();
    return (
        <motion.div
            className="hidden fixed top-0 left-8 bg-white opacity-30 n h-screen w-1 lg:flex origin-top z-20"
            style={{
                scaleY: scrollYProgress,
            }}
        ></motion.div>
    );
};

export default Scroll;
