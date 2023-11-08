/** @type {import('next').NextConfig} */

if (process.env.NODE_ENV === "development") {
    const nextConfig = {};
    module.exports = nextConfig;
} else {
    const nextConfig = {
        trailingSlash: true,
        output: "export",
    };
    module.exports = nextConfig;
}
