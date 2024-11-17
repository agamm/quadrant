import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.logo.dev",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
