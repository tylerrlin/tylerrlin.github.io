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
                unique bitstrings. In this context, more probable chess moves
                are given shorter bitstrings.
                <br />
                <br />A machine learning model is used to predict the next move
                in a chess game. Models are trained on a dataset of thousands of
                chess games from lichess, filtered to only include games from
                players with average ratings inside a certain range. As a
                result, the model is able to accurately predict the next move
                from a given position based on the player&apos;s rating.
                <br />
                <br />
                From probabilities given by the model, Huffman Coding is used to
                adaptively encode/decode chess games into binary strings. Due to
                the model being trained on games from players with similar
                ratings, the codes generated accurately reflect the probability
                of a move being played in a given position.
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
