import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import {
	type Content,
	type CoreValueData,
	HERO_DEFAULTS,
	type HeroSlideData,
	mergeContent,
	VALUE_DEFAULTS,
} from "@/lib/content";
import { prisma } from "@/lib/prisma";

/**
 * Cached public content.
 * The database is in eu-west-1, so every uncached query costs ~1s from Nigeria.
 * Public content changes rarely, so each query is cached server-side for
 * PUBLIC_TTL seconds. Every admin mutation calls invalidatePublic() (see
 * lib/admin-route.ts), so edits still appear on the site immediately.
 */
export const PUBLIC_TTL = 60;
export const PUBLIC_TAG = "public-content";

// Connection retries are handled globally in lib/prisma.ts.
function cached<T>(key: string, fn: () => Promise<T>) {
	return unstable_cache(fn, ["public", key], { revalidate: PUBLIC_TTL, tags: [PUBLIC_TAG] })();
}

export const getSiteMeta = () => cached("site-meta", () => prisma.siteMeta.findFirst());

/**
 * Cap how long a page waits on the database. During `next build` a slow/unreachable DB
 * must not fail the build — pages fall back to defaults and refresh via ISR once live.
 */
const DB_WAIT_MS = process.env.NEXT_PHASE === "phase-production-build" ? 8_000 : 25_000;
function timed<T>(p: Promise<T>): Promise<T> {
	return Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`database did not answer within ${DB_WAIT_MS / 1000}s`)), DB_WAIT_MS))]);
}

/** Editable page text merged over defaults. Never throws — falls back to defaults. */
export async function getContent(): Promise<Content> {
	try {
		return await timed(cached("content", async () => mergeContent(await prisma.siteContent.findMany())));
	} catch (err) {
		console.error("[content] falling back to defaults:", err instanceof Error ? err.message.split("\n")[0] : err);
		return mergeContent([]);
	}
}

/** Published hero slides; defaults if none/unreachable. */
export async function getHeroSlides(): Promise<HeroSlideData[]> {
	try {
		const rows = await timed(
			cached("hero-slides", () => prisma.heroSlide.findMany({ where: { published: true }, orderBy: { order: "asc" } })),
		);
		if (rows.length > 0) return rows;
	} catch (err) {
		console.error("[hero] falling back to defaults:", err instanceof Error ? err.message.split("\n")[0] : err);
	}
	return HERO_DEFAULTS.map((s, i) => ({ ...s, id: `default-${i}` }));
}

/** Published values; defaults if none/unreachable. */
export async function getValues(): Promise<CoreValueData[]> {
	try {
		const rows = await timed(
			cached("values", () => prisma.coreValue.findMany({ where: { published: true }, orderBy: { order: "asc" } })),
		);
		if (rows.length > 0) return rows;
	} catch (err) {
		console.error("[values] falling back to defaults:", err instanceof Error ? err.message.split("\n")[0] : err);
	}
	return VALUE_DEFAULTS.map((v, i) => ({ ...v, id: `default-${i}` }));
}

/** Call after any admin change so the public site updates immediately. */
export function invalidatePublic() {
	revalidateTag(PUBLIC_TAG, { expire: 0 });
}

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
