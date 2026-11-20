import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const socialLinkSchema = z.object({
	platform: z.string().min(1).optional(),
	url: z.string().url().optional(),
	published: z.boolean().optional(),
});

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/site-meta"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		const body = await request.json();
		const parsed = socialLinkSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid social link data", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const social = await prisma.socialLink.update({
			where: { id },
			data: parsed.data,
		});

		return NextResponse.json(social);
	} catch (error) {
		console.error("[API] PATCH /api/admin/socials/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to update social link" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/site-meta"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		await prisma.socialLink.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE /api/admin/socials/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to delete social link" },
			{ status: 500 },
		);
	}
}
