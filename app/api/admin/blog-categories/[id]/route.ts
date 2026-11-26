import { withInvalidate } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const categorySchema = z.object({
	name: z.string().min(1, "Category name is required"),
});

type RouteParams = {
	params: Promise<{ id: string }>;
};

async function PATCHHandler(request: Request, { params }: RouteParams) {
	if (!(await verifyAuth("/admin/blog"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

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
		if (existing && existing.id !== id) {
			return NextResponse.json(
				{ error: "Category name already exists" },
				{ status: 400 },
			);
		}

		const category = await prisma.blogCategory.update({
			where: { id },
			data: { name },
		});

		return NextResponse.json(category);
	} catch (error) {
		console.error(`[API] PATCH /api/admin/blog-categories/${id} error:`, error);
		return NextResponse.json(
			{ error: "Failed to update category" },
			{ status: 500 },
		);
	}
}

async function DELETEHandler(_request: Request, { params }: RouteParams) {
	if (!(await verifyAuth("/admin/blog"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		await prisma.blogCategory.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(
			`[API] DELETE /api/admin/blog-categories/${id} error:`,
			error,
		);
		return NextResponse.json(
			{ error: "Failed to delete category" },
			{ status: 500 },
		);
	}
}

export const PATCH = withInvalidate(PATCHHandler);
export const DELETE = withInvalidate(DELETEHandler);
