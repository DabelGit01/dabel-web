import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Dabel Resources Ventures Limited",
		short_name: "Dabel",
		description: "Integrated marine logistics, procurement and environmental solutions.",
		start_url: "/",
		display: "standalone",
		background_color: "#1C1C3A",
		theme_color: "#1C1C3A",
		icons: [
			{ src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
			{ src: "/apple-icon", type: "image/png", sizes: "180x180" },
		],
	};
}
