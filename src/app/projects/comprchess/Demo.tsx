"use client";

import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import { demoGameFENs, demoGameData, demoGameCodes } from "./DemoData";

const Demo = () => {
    const [positionIndex, setPositionIndex] = useState(0);

    const darkSquareStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        border: "1px solid white",
        borderRadius: "7px",
    };
    const lightSquareStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        border: "1px solid white",
        borderRadius: "7px",
    };

    const rowTitles = ["Move", "Probability", "Code"];

    return (
        <div className="flex flex-col items-start justify-start mt-16 w-full gap-10 lg:flex-row">
            <div className="w-2/3 lg:w-2/5 aspect-square mb-16 lg:mb-0 self-center">
                <Chessboard
                    position={demoGameFENs[positionIndex]}
                    arePiecesDraggable={false}
                    customDarkSquareStyle={darkSquareStyle}
                    customLightSquareStyle={lightSquareStyle}
                />
                <div className="mt-10 w-full h-10 flex gap-3 items-center justify-center">
                    <button
                        onClick={() => {
                            if (positionIndex > 0) {
                                setPositionIndex(0);
                            }
                        }}
                        className="bg-white opacity-50 h-full w-1/5 text-black rounded-xl font-bold hover:opacity-100 duration-500"
                    >
                        {"<<"}
                    </button>
                    <button
                        onClick={() => {
                            if (positionIndex > 0) {
                                setPositionIndex(positionIndex - 1);
                            }
                        }}
                        className="bg-white opacity-50 h-full w-1/5 text-black rounded-xl font-bold hover:opacity-100 duration-500"
                    >
                        {"<"}
                    </button>
                    <button
                        onClick={() => {
                            if (positionIndex < demoGameFENs.length - 1) {
                                setPositionIndex(positionIndex + 1);
                            }
                        }}
                        className="bg-white opacity-50 h-full w-1/5 text-black rounded-xl font-bold hover:opacity-100 duration-500"
                    >
                        {">"}
                    </button>
                    <button
                        onClick={() => {
                            if (positionIndex < demoGameFENs.length - 1) {
                                setPositionIndex(demoGameFENs.length - 1);
                            }
                        }}
                        className="bg-white opacity-50 h-full w-1/5 text-black rounded-xl font-bold hover:opacity-100 duration-500"
                    >
                        {">>"}
                    </button>
                </div>
            </div>
            <div className="w-full flex flex-col items-center justify-start lg:w-3/5 gap-6">
                <div className="flex justify-between w-2/3 font-roboto text-md">
                    {rowTitles.map((row, index) => (
                        <div key={index} className="flex flex-col gap-1">
                            <h3 className="underline underline-offset-8 mb-3">
                                {row}
                            </h3>
                            {demoGameData[positionIndex].map((data) => (
                                <p key={index}>{data[index]}</p>
                            ))}
                            <p>...</p>
                        </div>
                    ))}
                </div>
                <div className="w-2/3 text-start font-roboto">
                    <h3 className="underline underline-offset-8 mb-6 text-md">
                        {`Code (${demoGameCodes[positionIndex].length} bit${
                            demoGameCodes[positionIndex].length === 1 ? "" : "s"
                        }):`}
                    </h3>
                    <p className="break-all text-sm">
                        {demoGameCodes[positionIndex]}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Demo;
