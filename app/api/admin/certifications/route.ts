import { withInvalidate } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const certificationSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	year: z.string().min(1),
	imageUrl: z.string().optional().nullable(),
	order: z.number().optional(),
	published: z.boolean().optional(),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const certifications = await prisma.certification.findMany({
			orderBy: { order: "asc" },
		});
		return NextResponse.json(certifications);
	} catch (error) {
		console.error("[API] GET /api/admin/certifications error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch certifications" },
			{ status: 500 },
		);
	}
}

async function POSTHandler(request: Request) {
	if (!(await verifyAuth("/admin/site-meta"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
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

		const certification = await prisma.certification.create({
			data: parsed.data,
		});

		return NextResponse.json(certification, { status: 201 });
	} catch (error) {
		console.error("[API] POST /api/admin/certifications error:", error);
		return NextResponse.json(
			{ error: "Failed to create certification" },
			{ status: 500 },
		);
	}
}

export const POST = withInvalidate(POSTHandler);
