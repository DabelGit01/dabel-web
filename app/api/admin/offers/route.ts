import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const offerSchema = z.object({
	name: z.string().min(2),
	slug: z.string().min(2),
	category: z.string().min(2),
	status: z.string().min(2),
	description: z.string().min(10),
	subTopic: z.string().min(2),
	features: z
		.array(z.object({ title: z.string(), description: z.string() }))
		.optional()
		.default([]),
	tags: z.array(z.string()).optional().default([]),
	order: z.number().optional().default(0),
	published: z.boolean().optional().default(true),
	price: z.number().nullable().optional(),
	purchaseUrl: z.string().nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	galleryUrls: z.array(z.string()).optional().default([]),
	gallery: z
		.array(z.object({ url: z.string(), title: z.string() }))
		.optional()
		.default([]),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const offers = await prisma.offer.findMany({
			orderBy: { order: "asc" },
		});
		return NextResponse.json(offers);
	} catch (error) {
		console.error("[API] GET /api/admin/offers error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch offers" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	if (!(await verifyAuth("/admin/offers"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = offerSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid offer data" },
				{ status: 400 },
			);
		}

		const offer = await prisma.offer.create({ data: parsed.data });
		try {
			revalidatePath("/");
			revalidatePath("/offers");
			revalidatePath(`/offers/${offer.slug}`);
		} catch (err) {
			console.error("Failed to revalidate paths on create:", err);
		}
		return NextResponse.json(offer, { status: 201 });
	} catch (error) {
		console.error("[API] POST /api/admin/offers error:", error);
		return NextResponse.json(
			{ error: "Failed to create offer" },
			{ status: 500 },
		);
	}
}
