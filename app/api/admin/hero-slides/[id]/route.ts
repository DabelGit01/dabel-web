import { NextResponse } from "next/server";
import { withInvalidate } from "@/lib/admin-route";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteStorageFile } from "@/lib/supabase";
import { heroSlideSchema } from "@/lib/admin-schemas";

const PERM = "/admin/content";
type Ctx = { params: Promise<{ id: string }> };

async function PATCHHandler(req: Request, { params }: Ctx) {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { id } = await params;
	const parsed = heroSlideSchema.partial().safeParse(await req.json().catch(() => null));
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid slide" }, { status: 400 });
	}
	try {
		const before = await prisma.heroSlide.findUnique({ where: { id }, select: { imageUrl: true } });
		const slide = await prisma.heroSlide.update({ where: { id }, data: parsed.data });
		if (before && parsed.data.imageUrl && before.imageUrl !== parsed.data.imageUrl) await deleteStorageFile(before.imageUrl);
		return NextResponse.json(slide);
	} catch (error) {
		console.error("[API] PATCH hero-slide error:", error);
		return NextResponse.json({ error: "Failed to update slide" }, { status: 500 });
	}
}

async function DELETEHandler(_req: Request, { params }: Ctx) {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { id } = await params;
	try {
		const slide = await prisma.heroSlide.delete({ where: { id } });
		await deleteStorageFile(slide.imageUrl);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE hero-slide error:", error);
		return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 });
	}
}

export const PATCH = withInvalidate(PATCHHandler);
export const DELETE = withInvalidate(DELETEHandler);
