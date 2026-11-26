import { withInvalidate } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const blogPostSchema = z.object({
	title: z.string().min(2, "Title must be at least 2 characters"),
	content: z.string().min(1, "Content is required"),
	imageUrl: z.preprocess(
		(value) =>
			typeof value === "string" && value.trim() === "" ? undefined : value,
		z.string().optional().nullable(),
	),
	galleryUrls: z.array(z.string()).optional().default([]),
	gallery: z
		.array(z.object({ url: z.string(), title: z.string() }))
		.optional()
		.default([]),
	categoryId: z.string().min(1, "Category is required"),
	published: z.boolean().optional(),
	authorName: z.string().optional(),
	readTime: z.string().optional(),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const posts = await prisma.blogPost.findMany({
			include: {
				category: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(posts);
	} catch (error) {
		console.error("[API] GET /api/admin/blog error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch blog posts" },
			{ status: 500 },
		);
	}
}

async function POSTHandler(request: Request) {
	if (!(await verifyAuth("/admin/blog"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = blogPostSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid blog post data", details: parsed.error.errors },
				{ status: 400 },
			);
		}

		const post = await prisma.blogPost.create({
			data: parsed.data,
			include: {
				category: true,
			},
		});

		return NextResponse.json(post, { status: 201 });
	} catch (error) {
		console.error("[API] POST /api/admin/blog error:", error);
		return NextResponse.json(
			{ error: "Failed to create blog post" },
			{ status: 500 },
		);
	}
}

export const POST = withInvalidate(POSTHandler);
