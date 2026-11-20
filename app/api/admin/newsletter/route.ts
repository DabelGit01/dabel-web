import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const subscribers = await prisma.newsletterSubscriber.findMany({
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(subscribers);
	} catch (error) {
		console.error("[API] GET /api/admin/newsletter error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscribers" },
			{ status: 500 },
		);
	}
}
