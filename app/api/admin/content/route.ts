import { NextResponse } from "next/server";
import { z } from "zod";
import { withInvalidate } from "@/lib/admin-route";
import { verifyAuth } from "@/lib/auth";
import { CONTENT_DEFAULTS, isSectionKey, mergeContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

const PERM = "/admin/content";

/** Current page text (stored values merged over defaults) + which sections have been customised. */
export async function GET() {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	try {
		const rows = await prisma.siteContent.findMany();
		return NextResponse.json({
			content: mergeContent(rows),
			customised: Object.fromEntries(rows.map((r) => [r.key, r.updatedAt])),
		});
	} catch (error) {
		console.error("[API] GET /api/admin/content error:", error);
		return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
	}
}

const putSchema = z.object({
	key: z.string(),
	value: z.record(z.string().max(5000)), // keywords/descriptions fit comfortably
});

/** Save one section. Only known fields are stored; empty strings reset a field to its default. */
async function PUTHandler(req: Request) {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const parsed = putSchema.safeParse(await req.json().catch(() => null));
	if (!parsed.success || !isSectionKey(parsed.data.key)) {
		return NextResponse.json({ error: "Invalid section" }, { status: 400 });
	}
	const { key } = parsed.data;
	const allowed = Object.keys(CONTENT_DEFAULTS[key]);
	const value = Object.fromEntries(
		Object.entries(parsed.data.value)
			.filter(([f]) => allowed.includes(f))
			.map(([f, v]) => [f, v.trim()]),
	);
	try {
		await prisma.siteContent.upsert({ where: { key }, update: { value }, create: { key, value } });
		const rows = await prisma.siteContent.findMany();
		return NextResponse.json({ content: mergeContent(rows) });
	} catch (error) {
		console.error("[API] PUT /api/admin/content error:", error);
		return NextResponse.json({ error: "Failed to save" }, { status: 500 });
	}
}

/** Reset a section to defaults. */
async function DELETEHandler(req: Request) {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const key = new URL(req.url).searchParams.get("key") ?? "";
	if (!isSectionKey(key)) return NextResponse.json({ error: "Invalid section" }, { status: 400 });
	try {
		await prisma.siteContent.deleteMany({ where: { key } });
		return NextResponse.json({ content: mergeContent(await prisma.siteContent.findMany()) });
	} catch (error) {
		console.error("[API] DELETE /api/admin/content error:", error);
		return NextResponse.json({ error: "Failed to reset" }, { status: 500 });
	}
}

export const PUT = withInvalidate(PUTHandler);
export const DELETE = withInvalidate(DELETEHandler);
