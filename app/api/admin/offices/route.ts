import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const officeSchema = z.object({
	name: z.string().min(1),
	address: z.string().min(1),
	email: z.string().email(),
	phone: z.string().min(1),
	order: z.number().optional(),
	published: z.boolean().optional(),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const offices = await prisma.office.findMany({
			orderBy: { order: "asc" },
		});
		return NextResponse.json(offices);
	} catch (error) {
		console.error("[API] GET /api/admin/offices error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch offices" },
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
		const parsed = officeSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid office data", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const office = await prisma.office.create({
			data: parsed.data,
		});

		return NextResponse.json(office, { status: 201 });
	} catch (error) {
		console.error("[API] POST /api/admin/offices error:", error);
		return NextResponse.json(
			{ error: "Failed to create office" },
			{ status: 500 },
		);
	}
}
