import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;
		const decodedSlug = decodeURIComponent(slug);
		let offer = await prisma.offer.findUnique({ where: { slug: decodedSlug } });

		if (!offer) {
			offer = await prisma.offer.findFirst({
				where: {
					OR: [
						{ slug: decodedSlug },
						{ slug: `${decodedSlug}.` },
						{ slug: slug },
						{ slug: `${slug}.` },
					],
				},
			});
		}

		if (!offer) {
			return NextResponse.json({ error: "Offer not found" }, { status: 404 });
		}

		return NextResponse.json(offer);
	} catch (error) {
		console.error("[API] GET /api/public/offers/[slug] error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch offer" },
			{ status: 500 },
		);
	}
}
