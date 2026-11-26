import { withInvalidate } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const contactDetailSchema = z.object({
	platform: z.string().min(1),
	label: z.string().min(1),
	value: z.string().min(1),
	url: z.string().min(1),
	order: z.number().optional(),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const contacts = await prisma.contactDetail.findMany({
			orderBy: { order: "asc" },
		});
		return NextResponse.json(contacts);
	} catch (error) {
		console.error("[API] GET /api/admin/contacts error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch contact details" },
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
		const parsed = contactDetailSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{
					error: "Invalid contact detail data",
					details: parsed.error.flatten(),
				},
				{ status: 400 },
			);
		}

		const contact = await prisma.contactDetail.create({
			data: parsed.data,
		});

		return NextResponse.json(contact, { status: 201 });
	} catch (error) {
		console.error("[API] POST /api/admin/contacts error:", error);
		return NextResponse.json(
			{ error: "Failed to create contact detail" },
			{ status: 500 },
		);
	}
}

export const POST = withInvalidate(POSTHandler);
