"use client";

import React from "react";
import { motion } from "framer-motion";

const Underline = ({
    widthPercent,
    marginTop,
    bg,
}: {
    widthPercent: number;
    marginTop: string;
    bg?: string;
}) => {
    return (
        <motion.div
            initial={{
                width: 0,
            }}
            whileInView={{ width: `${widthPercent}%` }}
            transition={{ duration: 0.5 }}
            viewport={{ margin: "-100px" }}
            className={`h-1 ${bg ? bg : "bg-white"}`}
            style={{
                marginTop: marginTop,
            }}
        ></motion.div>
    );
};

export default Underline;
