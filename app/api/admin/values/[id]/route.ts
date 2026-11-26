import { NextResponse } from "next/server";
import { withInvalidate } from "@/lib/admin-route";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteStorageFiles } from "@/lib/supabase";
import { valueSchema } from "@/lib/admin-schemas";

const PERM = "/admin/content";
type Ctx = { params: Promise<{ id: string }> };

async function PATCHHandler(req: Request, { params }: Ctx) {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { id } = await params;
	const parsed = valueSchema.partial().safeParse(await req.json().catch(() => null));
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid value" }, { status: 400 });
	}
	try {
		const before = await prisma.coreValue.findUnique({ where: { id }, select: { images: true } });
		const value = await prisma.coreValue.update({ where: { id }, data: parsed.data });
		if (before && parsed.data.images) await deleteStorageFiles(before.images.filter((u) => !parsed.data.images?.includes(u)));
		return NextResponse.json(value);
	} catch (error) {
		console.error("[API] PATCH value error:", error);
		return NextResponse.json({ error: "Failed to update value" }, { status: 500 });
	}
}

async function DELETEHandler(_req: Request, { params }: Ctx) {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { id } = await params;
	try {
		const value = await prisma.coreValue.delete({ where: { id } });
		await deleteStorageFiles(value.images);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE value error:", error);
		return NextResponse.json({ error: "Failed to delete value" }, { status: 500 });
	}
}

export const PATCH = withInvalidate(PATCHHandler);
export const DELETE = withInvalidate(DELETEHandler);
