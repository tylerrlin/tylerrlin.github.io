"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import Underline from "@/components/Underline";

const ChessCompression = () => {
    return (
        <motion.div className="w-full flex flex-col items-center justify-center">
            <h1 className="font-poppins text-4xl text-center lg:text-5xl tracking-widest">
                COMPR[CH]ESS
            </h1>
            <Underline widthPercent={70} marginTop="40px" />
            <p className="font-roboto text-lg text-center tracking-wide mt-16"></p>
        </motion.div>
    );
};

export default ChessCompression;
