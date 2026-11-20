import "server-only";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Cached public content.
 * The database is in eu-west-1, so every uncached query costs ~1s from Nigeria.
 * Public content changes rarely, so each query is cached server-side for
 * PUBLIC_TTL seconds: visitors get instant responses, and admin edits appear
 * within a minute. Call `revalidateTag(PUBLIC_TAG)` to refresh immediately.
 */
export const PUBLIC_TTL = 60;
export const PUBLIC_TAG = "public-content";

// Connection retries are handled globally in lib/prisma.ts.
function cached<T>(key: string, fn: () => Promise<T>) {
	return unstable_cache(fn, ["public", key], { revalidate: PUBLIC_TTL, tags: [PUBLIC_TAG] })();
}

export const getSiteMeta = () => cached("site-meta", () => prisma.siteMeta.findFirst());

export const getOffers = () =>
	cached("offers", () => prisma.offer.findMany({ where: { published: true }, orderBy: { order: "asc" } }));

export const getOffices = () =>
	cached("offices", () => prisma.office.findMany({ where: { published: true }, orderBy: { order: "asc" } }));

export const getContacts = () =>
	cached("contacts", () => prisma.contactDetail.findMany({ orderBy: { order: "asc" } }));

export const getSocials = () => cached("socials", () => prisma.socialLink.findMany({ where: { published: true } }));

export const getTeam = () => cached("team", () => prisma.teamMember.findMany({ orderBy: { order: "asc" } }));

export const getCertifications = () =>
	cached("certifications", () =>
		prisma.certification.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
	);

export const getBlogCategories = () =>
	cached("blog-categories", () => prisma.blogCategory.findMany({ orderBy: { name: "asc" } }));

export function getBlogPosts(filter: { categoryId?: string | null; category?: string | null }) {
	const categoryId = filter.categoryId && filter.categoryId !== "all" ? filter.categoryId : null;
	const category = !categoryId && filter.category && filter.category.toLowerCase() !== "all" ? filter.category : null;
	return cached(`blog:${categoryId ?? ""}:${category ?? ""}`, () =>
		prisma.blogPost.findMany({
			where: {
				published: true,
				...(categoryId ? { categoryId } : {}),
				...(category ? { category: { name: { equals: category, mode: "insensitive" as const } } } : {}),
			},
			include: { category: true },
			orderBy: { createdAt: "desc" },
		}),
	);
}

/** Wrap a cached getter as a JSON route response with consistent error handling. */
export async function publicJson<T>(label: string, getter: () => Promise<T>) {
	try {
		return NextResponse.json(await getter(), {
			headers: { "Cache-Control": `public, s-maxage=${PUBLIC_TTL}, stale-while-revalidate=300` },
		});
	} catch (error) {
		console.error(`[API] GET /api/public/${label} error:`, error);
		return NextResponse.json({ error: `Failed to fetch ${label}` }, { status: 500 });
	}
}
