import { withInvalidate } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const officeSchema = z.object({
	name: z.string().min(1).optional(),
	address: z.string().min(1).optional(),
	email: z.string().email().optional(),
	phone: z.string().min(1).optional(),
	order: z.number().optional(),
	published: z.boolean().optional(),
});

async function PATCHHandler(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/site-meta"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		const body = await request.json();
		const parsed = officeSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid office data", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const office = await prisma.office.update({
			where: { id },
			data: parsed.data,
		});

		return NextResponse.json(office);
	} catch (error) {
		console.error("[API] PATCH /api/admin/offices/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to update office" },
			{ status: 500 },
		);
	}
}

async function DELETEHandler(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/site-meta"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		await prisma.office.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE /api/admin/offices/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to delete office" },
			{ status: 500 },
		);
	}
}

export const PATCH = withInvalidate(PATCHHandler);
export const DELETE = withInvalidate(DELETEHandler);
