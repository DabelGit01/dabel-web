import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const socialLinkSchema = z.object({
	platform: z.string().min(1),
	url: z.string().url(),
	published: z.boolean().optional(),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const socials = await prisma.socialLink.findMany({
			orderBy: { platform: "asc" },
		});
		return NextResponse.json(socials);
	} catch (error) {
		console.error("[API] GET /api/admin/socials error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch socials" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	if (!(await verifyAuth("/admin/site-meta"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = socialLinkSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid social link data", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const social = await prisma.socialLink.create({
			data: parsed.data,
		});

		return NextResponse.json(social, { status: 201 });
	} catch (error) {
		console.error("[API] POST /api/admin/socials error:", error);
		return NextResponse.json(
			{ error: "Failed to create social link" },
			{ status: 500 },
		);
	}
}
