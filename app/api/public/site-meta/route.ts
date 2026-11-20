import { getSiteMeta, publicJson } from "@/lib/public-data";

// Cached server-side for PUBLIC_TTL seconds (see lib/public-data.ts)
export async function GET() {
	return publicJson("site-meta", getSiteMeta);
}
