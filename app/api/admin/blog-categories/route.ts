import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const categorySchema = z.object({
	name: z.string().min(1, "Category name is required"),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const categories = await prisma.blogCategory.findMany({
			orderBy: { name: "asc" },
		});
		return NextResponse.json(categories);
	} catch (error) {
		console.error("[API] GET /api/admin/blog-categories error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	if (!(await verifyAuth("/admin/blog"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = categorySchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid category name" },
				{ status: 400 },
			);
		}

		const { name } = parsed.data;

		// Check duplicate name
		const existing = await prisma.blogCategory.findUnique({
			where: { name },
		});
		if (existing) {
			return NextResponse.json(
				{ error: "Category name already exists" },
				{ status: 400 },
			);
		}

		const category = await prisma.blogCategory.create({
			data: { name },
		});

		return NextResponse.json(category, { status: 201 });
	} catch (error) {
		console.error("[API] POST /api/admin/blog-categories error:", error);
		return NextResponse.json(
			{ error: "Failed to create category" },
			{ status: 500 },
		);
	}
}
