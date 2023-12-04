"use client";

import React from "react";
import Demo from "./Demo";

import Underline from "@/components/Underline";
import Link from "next/link";

const ChessCompression = () => {
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <h1 className="font-poppins text-4xl text-center lg:text-5xl tracking-widest">
                COMPR[CH]ESS
            </h1>
            <Underline widthPercent={70} marginTop="40px" />
            <h2 className="font-roboto text-lg text-center tracking-wider mt-16 leading-loose lg:text-xl">
                An innovative approach to lossless chess game compression,
                seamlessly blending chess engines, machine learning, and Huffman
                Coding.
            </h2>
            <h2 className="font-poppins text-xl text-center tracking-wider mt-24 leading-loose lg:text-2xl">
                DEMO VISUALIZATION
            </h2>
            <Underline widthPercent={30} marginTop="20px" />
            <Demo />
            <h2 className="font-poppins text-xl text-center tracking-wider mt-24 leading-loose lg:text-2xl">
                HOW IT WORKS
            </h2>
            <Underline widthPercent={30} marginTop="20px" />
            <h2 className="font-roboto text-md text-center tracking-wider mt-12 leading-loose lg:text-lg">
                This program utilizes Huffman Coding to encode/decode chess
                games. Huffman Coding is a technique where more probable
                characters or strings of characters are assigned lower-length,
                unique bitstrings. Using a chess engine to evaluate positions
                and a machine learning model trained to predict a player&apos;s
                next move, every unique move is encoded and the resulting
                move&apos;s code is appended to a bitstring containing the code
                of the whole game. By training models on a large dataset of a
                specified rating range, the program can encode and decode games
                more efficiently in that rating range. Using this technique, an
                average compression rate of 85% was achieved on a dataset of
                1,000 games from lichess.org.
            </h2>
            <Link
                href="https://github.com/tylerrlin/compr-ch-ess"
                target="_blank"
                className="mt-20 mb-40 font-poppins text-black text-xl text-center w-64 leading-loose bg-white border-2 rounded-lg opacity-70 hover:opacity-100 duration-500"
            >
                Check it out on Github
            </Link>
        </div>
    );
};

export default ChessCompression;
