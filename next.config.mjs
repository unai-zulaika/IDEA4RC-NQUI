/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.idea4rc.eu",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
