"use client";

import Link from "next/link";
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faA, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const HomeButton = () => {
    return (
        <Link
            href={"/"}
            className="flex gap-3 font-poppins justify-start items-center tracking-wider text-xl fixed top-8 left-8 lg:left-14 opacity-40 hover:opacity-100 transition-opacity duration-300 ease-in-out"
        >
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            <div>Home</div>
        </Link>
    );
};

export default HomeButton;
