import { getBlogPosts, publicJson } from "@/lib/public-data";

// Cached server-side for PUBLIC_TTL seconds, per category filter (see lib/public-data.ts)
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	return publicJson("blog", () =>
		getBlogPosts({ categoryId: searchParams.get("categoryId"), category: searchParams.get("category") }),
	);
}
