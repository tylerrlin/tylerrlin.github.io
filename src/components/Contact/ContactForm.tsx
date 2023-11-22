import React from "react";

import { motion } from "framer-motion";

import Underline from "@/components/Underline";
import sendForm from "./SendForm";

const ContactForm = () => {
    const [textValues, setTextValues] = React.useState({
        name: "",
        email: "",
        message: "",
    });
    const [sent, setSent] = React.useState(false);
    const [validEmail, setValidEmail] = React.useState(true);

    return (
        <div className="w-full flex flex-col justify-center items-center gap-2 xl:w-3/5">
            <input
                type="text"
                placeholder="Name"
                value={textValues.name}
                onChange={(e) =>
                    setTextValues({ ...textValues, name: e.target.value })
                }
                className="bg-black border-none outline-none w-full font-poppins text-lg indent-5"
            />
            <Underline widthPercent={100} marginTop="10px" />
            <input
                type="email"
                placeholder="Email"
                value={textValues.email}
                onChange={(e) => {
                    let re =
                        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    setTextValues({ ...textValues, email: e.target.value });
                    if (e.target.value === "" || re.test(e.target.value)) {
                        setValidEmail(true);
                    } else {
                        setValidEmail(false);
                    }
                }}
                className="mt-20 bg-black border-none outline-none w-full font-poppins text-lg indent-5"
            />
            <Underline
                widthPercent={100}
                marginTop="10px"
                bg={`${validEmail ? "bg-white" : "bg-red-400"}`}
            />
            <textarea
                placeholder="Message"
                value={textValues.message}
                onChange={(e) =>
                    setTextValues({ ...textValues, message: e.target.value })
                }
                className="mt-20 bg-black border-none outline-none w-11/12 font-poppins text-lg max-h-96 h-32"
                style={{
                    minHeight: "100px",
                }}
            />
            <Underline widthPercent={100} marginTop="10px" />
            {sent ? (
                <div className="mt-24 w-full flex items-center gap-10 justify-center h-10">
                    <motion.div
                        animate={{ opacity: [0, 1, 0], x: [-100, 0, 100] }}
                        transition={{
                            delay: 0.1,
                            duration: 2,
                            ease: "easeInOut",
                        }}
                        className="font-poppins text-2xl absolute"
                    >
                        SENT SUCCESSFULLY!
                    </motion.div>
                    <motion.button
                        animate={{
                            x: [-100, 0],
                            opacity: [0, 1],
                            transition: {
                                delay: 2,
                                duration: 0.2,
                                ease: "easeInOut",
                            },
                        }}
                        whileHover={{
                            scale: 1.3,
                            rotate: [0, 30],
                            transition: { delay: 0, duration: 0.2 },
                        }}
                        className="z-20"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            onClick={() => {
                                setTextValues({
                                    name: "",
                                    email: "",
                                    message: "",
                                });
                                setSent(false);
                            }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </motion.button>
                </div>
            ) : (
                <motion.button
                    initial={{ opacity: 0.5 }}
                    whileHover={{ scale: 1.1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                        if (!validEmail || textValues.email === "") {
                            setValidEmail(false);
                            return;
                        }
                        try {
                            sendForm(textValues);
                            setSent(true);
                        } catch (e) {
                            console.log(e);
                        }
                    }}
                    className="mt-24 text-black border-none outline-none w-1/3 bg-white font-poppins text-2xl leading-10 tracking-widest rounded-xl h-10"
                >
                    SEND.
                </motion.button>
            )}
        </div>
    );
};

export default ContactForm;
