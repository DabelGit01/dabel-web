import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const messages = await prisma.contactMessage.findMany({
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(messages);
	} catch (error) {
		console.error("[API] GET /api/admin/messages error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 },
		);
	}
}
