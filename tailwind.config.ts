import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                green: "#557355",
                "green-light": "#7a9e7a",
                "green-dark": "#3c503c",
            },
            fontFamily: {
                poppins: ["var(--font-poppins)"],
                roboto: ["var(--font-roboto-mono)"],
            },
        },
    },
    plugins: [],
};
export default config;
