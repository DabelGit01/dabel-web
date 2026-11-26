import { withInvalidate } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const contactDetailSchema = z.object({
	platform: z.string().min(1).optional(),
	label: z.string().min(1).optional(),
	value: z.string().min(1).optional(),
	url: z.string().min(1).optional(),
	order: z.number().optional(),
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
		const parsed = contactDetailSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{
					error: "Invalid contact detail data",
					details: parsed.error.flatten(),
				},
				{ status: 400 },
			);
		}

		const contact = await prisma.contactDetail.update({
			where: { id },
			data: parsed.data,
		});

		return NextResponse.json(contact);
	} catch (error) {
		console.error("[API] PATCH /api/admin/contacts/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to update contact detail" },
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
		await prisma.contactDetail.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE /api/admin/contacts/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to delete contact detail" },
			{ status: 500 },
		);
	}
}

export const PATCH = withInvalidate(PATCHHandler);
export const DELETE = withInvalidate(DELETEHandler);
