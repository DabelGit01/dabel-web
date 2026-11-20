import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/blog"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		await prisma.newsletterSubscriber.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE /api/admin/newsletter/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to delete subscriber" },
			{ status: 500 },
		);
	}
}
