import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteStorageFile } from "@/lib/supabase";

const siteMetaSchema = z.object({
	welcomeSubtitle: z.string().min(1),
	welcomeTitle: z.string().min(1),
	welcomeBody1: z.string().min(1),
	welcomeBody2: z.string().min(1),
	aboutHistory: z.string().min(1),
	founderName: z.string().min(1),
	founderRole: z.string().min(1),
	founderBio: z.string().min(1),
	founderImageUrl: z.string().nullable().optional(),
	aboutBody: z.string().min(1),
	aboutMission: z.string().min(1),
	aboutVision: z.string().min(1),
	enquiryText: z.string().min(1),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const meta = await prisma.siteMeta.findFirst();
		return NextResponse.json(meta);
	} catch (error) {
		console.error("[API] GET /api/admin/site-meta error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch site meta" },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: Request) {
	if (!(await verifyAuth("/admin/site-meta"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = siteMetaSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid site meta data", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		let meta = await prisma.siteMeta.findFirst();

		if (meta) {
			if (
				parsed.data.founderImageUrl !== undefined &&
				parsed.data.founderImageUrl !== meta.founderImageUrl
			) {
				if (meta.founderImageUrl && !meta.founderImageUrl.startsWith("/")) {
					await deleteStorageFile(meta.founderImageUrl);
				}
			}
			meta = await prisma.siteMeta.update({
				where: { id: meta.id },
				data: parsed.data,
			});
		} else {
			meta = await prisma.siteMeta.create({
				data: parsed.data,
			});
		}

		return NextResponse.json(meta);
	} catch (error) {
		console.error("[API] PATCH /api/admin/site-meta error:", error);
		return NextResponse.json(
			{ error: "Failed to update site meta" },
			{ status: 500 },
		);
	}
}
