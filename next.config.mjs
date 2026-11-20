/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		tsconfigPath: "./tsconfig.json",
	},
	images: {
		// Next 16 only serves listed qualities; 85 is used for hero / page-header photos
		qualities: [75, 85],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	headers: async () => {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
				],
			},
		];
	},
	poweredByHeader: false,
	async redirects() {
		return [
			{ source: "/offers", destination: "/services", permanent: true },
			{ source: "/offers/:slug*", destination: "/services/:slug*", permanent: true },
			{ source: "/products", destination: "/services", permanent: true },
			{ source: "/products/:slug*", destination: "/services/:slug*", permanent: true },
			{ source: "/blog", destination: "/insights", permanent: true },
			{ source: "/blog/:id*", destination: "/insights/:id*", permanent: true },
		];
	},
};

export default nextConfig;
