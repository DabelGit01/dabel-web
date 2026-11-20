import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
	params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
	const { id } = await params;

	try {
		const post = await prisma.blogPost.findUnique({
			where: { id },
			include: {
				category: true,
			},
		});

		if (!post?.published) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		return NextResponse.json(post);
	} catch (error) {
		console.error(`[API] GET /api/public/blog/${id} error:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch blog post" },
			{ status: 500 },
		);
	}
}
