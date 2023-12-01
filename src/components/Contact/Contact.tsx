"use client";

import React from "react";

import { motion, easeInOut } from "framer-motion";

import ContactForm from "@/components/Contact/ContactForm";
import Link from "next/link";

const Contact = () => {
    const text = "CONTACT.";
    return (
        <div
            id="contact"
            className="flex flex-col items-center relative bg-black mb-52"
        >
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-poppins flex text-4xl text-center mt-36 lg:text-5xl tracking-widest"
            >
                {text.split("").map((letter, index) => (
                    <motion.h1
                        className={`w-min mr-2`}
                        key={index}
                        animate={{
                            y: [0, -10, 0],
                            color: ["#ffffff", "#557955", "#ffffff"],
                        }}
                        transition={{
                            repeat: Infinity,
                            repeatDelay: 5,
                            duration: 1,
                            delay: index * 0.2,
                            ease: easeInOut,
                        }}
                    >
                        {letter}
                    </motion.h1>
                ))}
            </motion.div>
            <div className="mt-32 w-3/5 h-full flex justify-center gap-48 xl:gap-20 flex-col xl:flex-row">
                <ContactForm />
                <div className="flex-col gap-10 flex w-3/5 xl:w-2/5">
                    <h2 className="text-3xl font-poppins mb-10">
                        Let&apos;s keep in touch...
                    </h2>
                    <Link
                        href="mailto:tylerrlin@gmail.com"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="text-xl opacity-50 duration-300 font-roboto hover:opacity-100 indent-5 text-green-light"
                    >
                        tylerrlin@gmail.com
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/tylerrlin/"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="text-xl opacity-50 duration-300 font-roboto hover:opacity-100 indent-5 text-green-light"
                    >
                        linkedin.com/in/tylerrlin
                    </Link>

                    <a
                        href="/resume.pdf"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <motion.div
                            initial={{ opacity: 0.5 }}
                            whileHover={{ scale: 1.1, opacity: 1 }}
                            className="w-32 text-center font-roboto text-xl bg-green-light text-black rounded-lg leading-10 ml-5 mt-5"
                        >
                            RESUME.
                        </motion.div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Contact;
