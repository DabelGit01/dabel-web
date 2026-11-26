import { NextResponse } from "next/server";
import { withInvalidate } from "@/lib/admin-route";
import { valueSchema } from "@/lib/admin-schemas";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PERM = "/admin/content";

export async function GET() {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	return NextResponse.json(await prisma.coreValue.findMany({ orderBy: { order: "asc" } }));
}

async function POSTHandler(req: Request) {
	if (!(await verifyAuth(PERM))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const parsed = valueSchema.safeParse(await req.json().catch(() => null));
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid value" }, { status: 400 });
	}
	const last = await prisma.coreValue.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
	const value = await prisma.coreValue.create({
		data: { ...parsed.data, order: parsed.data.order ?? (last ? last.order + 1 : 0) },
	});
	return NextResponse.json(value, { status: 201 });
}

export const POST = withInvalidate(POSTHandler);
