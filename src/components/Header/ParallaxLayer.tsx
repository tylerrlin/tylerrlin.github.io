import React from "react";
import Image from "next/image";

import { MotionValue, motion, useTransform } from "framer-motion";

interface ParallaxLayerProps {
    id: number;
    src: string;
    scroll: MotionValue<number>;
}

const ParallaxLayer = ({ id, src, scroll }: ParallaxLayerProps) => {
    return (
        <motion.div
            className="w-screen h-screen absolute"
            style={{
                y: useTransform(scroll, (value) => value / (id * 0.5 + 2)),
            }}
        >
            <Image
                className="object-cover object-center-bottom w-full h-full"
                alt=""
                src={src}
                quality={100}
                fill
                priority
            />
        </motion.div>
    );
};

export default ParallaxLayer;
