import React from "react";

import { motion } from "framer-motion";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SkillsItemProps {
    id: number;
    children: React.ReactNode;
    icon: IconDefinition;
    title: string;
}

const SkillsItem = ({ id, children, icon, title }: SkillsItemProps) => {
    return (
        <motion.li
            className="flex flex-col justify-center items-center w-full lg:w-1/2 text-center border-2 pt-8 pl-4 pr-4 border-white"
            initial={{
                x: -50,
                opacity: 0,
            }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ margin: `-100px` }}
            transition={{
                duration: 0.1,
                x: { duration: 0.3, delay: id * 0.1 },
                opacity: { duration: 0.3, delay: id * 0.1 },
            }}
            whileHover={{ scale: 1.05 }}
        >
            <div className="h-2/5 flex text-base flex-row justify-center items-center gap-4 lg:text-xl xl:flex-row lg:flex-col">
                <FontAwesomeIcon className="w-1/3" icon={icon} size="3x" />
                <h2 className="font-medium font-poppins h-12">{title}</h2>
            </div>
            <div className="flex text-sm text-gray-300 h-32 font-roboto xl:text-base lg:h-44 xl:h-52 items-center">
                {children}
            </div>
        </motion.li>
    );
};

export default SkillsItem;
