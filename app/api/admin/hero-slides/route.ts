import { NextResponse } from "next/server";
import { withInvalidate } from "@/lib/admin-route";
import { heroSlideSchema } from "@/lib/admin-schemas";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PERM = "/admin/content";

export async function GET() {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
	return NextResponse.json(slides);
}

async function POSTHandler(req: Request) {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const parsed = heroSlideSchema.safeParse(await req.json().catch(() => null));
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid slide" }, { status: 400 });
	}
	const last = await prisma.heroSlide.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
	const slide = await prisma.heroSlide.create({
		data: { ...parsed.data, order: parsed.data.order ?? (last ? last.order + 1 : 0) },
	});
	return NextResponse.json(slide, { status: 201 });
}

export const POST = withInvalidate(POSTHandler);
