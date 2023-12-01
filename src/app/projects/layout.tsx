"use client";

import { motion } from "framer-motion";

import HomeButton from "@/components/HomeButton";

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <motion.div
            className="flex justify-center mt-32"
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            transition={{
                duration: 1,
                ease: "easeInOut",
            }}
        >
            <HomeButton />
            <div className="w-2/3 text-center">{children}</div>
        </motion.div>
    );
}
