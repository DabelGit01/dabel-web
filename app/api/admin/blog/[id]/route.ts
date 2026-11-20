import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteStorageFile, deleteStorageFiles } from "@/lib/supabase";

interface GalleryImage {
	url: string;
	title: string;
}

const blogPostSchema = z.object({
	title: z.string().min(2).optional(),
	content: z.string().min(1).optional(),
	imageUrl: z.preprocess(
		(value) =>
			typeof value === "string" && value.trim() === "" ? null : value,
		z.string().nullable().optional(),
	),
	galleryUrls: z.array(z.string()).optional(),
	gallery: z.array(z.object({ url: z.string(), title: z.string() })).optional(),
	categoryId: z.string().min(1).optional(),
	published: z.boolean().optional(),
	authorName: z.string().optional(),
	readTime: z.string().optional(),
});

type RouteParams = {
	params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
	if (!(await verifyAuth("/admin/blog"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const body = await request.json();
		const parsed = blogPostSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid blog post data", details: parsed.error.errors },
				{ status: 400 },
			);
		}

		const existingPost = await prisma.blogPost.findUnique({
			where: { id },
			select: { imageUrl: true, galleryUrls: true, gallery: true },
		});

		if (existingPost) {
			if (
				parsed.data.imageUrl !== undefined &&
				parsed.data.imageUrl !== existingPost.imageUrl
			) {
				await deleteStorageFile(existingPost.imageUrl);
			}

			if (parsed.data.galleryUrls !== undefined && existingPost.galleryUrls) {
				const removedUrls = existingPost.galleryUrls.filter(
					(url) => !parsed.data.galleryUrls?.includes(url),
				);
				await deleteStorageFiles(removedUrls);
			}

			if (parsed.data.gallery !== undefined && existingPost.gallery) {
				const existingUrls = (
					(existingPost.gallery as unknown as GalleryImage[]) || []
				)
					.map((item) => item.url)
					.filter(Boolean);
				const incomingUrls = (parsed.data.gallery || []).map(
					(item) => item.url,
				);
				const removedUrls = existingUrls.filter(
					(url: string) => !incomingUrls.includes(url),
				);
				await deleteStorageFiles(removedUrls);
			}
		}

		const post = await prisma.blogPost.update({
			where: { id },
			data: parsed.data,
			include: {
				category: true,
			},
		});

		return NextResponse.json(post);
	} catch (error) {
		console.error(`[API] PATCH /api/admin/blog/${id} error:`, error);
		return NextResponse.json(
			{ error: "Failed to update blog post" },
			{ status: 500 },
		);
	}
}

export async function DELETE(_request: Request, { params }: RouteParams) {
	if (!(await verifyAuth("/admin/blog"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const existingPost = await prisma.blogPost.findUnique({
			where: { id },
			select: { imageUrl: true, galleryUrls: true, gallery: true },
		});

		if (existingPost) {
			const galleryUrls = (
				(existingPost.gallery as unknown as GalleryImage[]) || []
			)
				.map((item) => item.url)
				.filter(Boolean);
			const urlsToDelete = [
				existingPost.imageUrl,
				...(existingPost.galleryUrls || []),
				...galleryUrls,
			];
			await deleteStorageFiles(urlsToDelete);
		}

		await prisma.blogPost.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(`[API] DELETE /api/admin/blog/${id} error:`, error);
		return NextResponse.json(
			{ error: "Failed to delete blog post" },
			{ status: 500 },
		);
	}
}
