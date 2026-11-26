import { withInvalidate } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteStorageFile } from "@/lib/supabase";

const certificationSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	year: z.string().min(1).optional(),
	imageUrl: z.string().optional().nullable(),
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
		const parsed = certificationSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{
					error: "Invalid certification data",
					details: parsed.error.flatten(),
				},
				{ status: 400 },
			);
		}

		const existingCert = await prisma.certification.findUnique({
			where: { id },
			select: { imageUrl: true },
		});

		if (
			existingCert &&
			parsed.data.imageUrl !== undefined &&
			parsed.data.imageUrl !== existingCert.imageUrl
		) {
			await deleteStorageFile(existingCert.imageUrl);
		}

		const certification = await prisma.certification.update({
			where: { id },
			data: parsed.data,
		});

		return NextResponse.json(certification);
	} catch (error) {
		console.error("[API] PATCH /api/admin/certifications/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to update certification" },
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
		const existingCert = await prisma.certification.findUnique({
			where: { id },
			select: { imageUrl: true },
		});

		if (existingCert?.imageUrl) {
			await deleteStorageFile(existingCert.imageUrl);
		}

		await prisma.certification.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE /api/admin/certifications/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to delete certification" },
			{ status: 500 },
		);
	}
}

export const PATCH = withInvalidate(PATCHHandler);
export const DELETE = withInvalidate(DELETEHandler);
