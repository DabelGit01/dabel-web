import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteStorageFile, deleteStorageFiles } from "@/lib/supabase";

interface GalleryImage {
	url: string;
	title: string;
}

const offerSchema = z.object({
	name: z.string().min(2).optional(),
	slug: z.string().min(2).optional(),
	category: z.string().min(2).optional(),
	status: z.string().min(2).optional(),
	description: z.string().min(10).optional(),
	subTopic: z.string().min(2).optional(),
	features: z
		.array(z.object({ title: z.string(), description: z.string() }))
		.optional(),
	tags: z.array(z.string()).optional(),
	order: z.number().optional(),
	published: z.boolean().optional(),
	price: z.number().nullable().optional(),
	purchaseUrl: z.string().nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	galleryUrls: z.array(z.string()).optional(),
	gallery: z.array(z.object({ url: z.string(), title: z.string() })).optional(),
});

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/offers"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		const body = await request.json();
		const parsed = offerSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid offer data" },
				{ status: 400 },
			);
		}

		const existingOffer = await prisma.offer.findUnique({
			where: { id },
			select: { slug: true, imageUrl: true, galleryUrls: true, gallery: true },
		});

		if (existingOffer) {
			if (
				parsed.data.imageUrl !== undefined &&
				parsed.data.imageUrl !== existingOffer.imageUrl
			) {
				await deleteStorageFile(existingOffer.imageUrl);
			}

			if (parsed.data.galleryUrls !== undefined && existingOffer.galleryUrls) {
				const removedUrls = existingOffer.galleryUrls.filter(
					(url) => !parsed.data.galleryUrls?.includes(url),
				);
				await deleteStorageFiles(removedUrls);
			}

			if (parsed.data.gallery !== undefined && existingOffer.gallery) {
				const existingUrls = (
					(existingOffer.gallery as unknown as GalleryImage[]) || []
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

		const offer = await prisma.offer.update({
			where: { id },
			data: parsed.data,
		});

		try {
			revalidatePath("/");
			revalidatePath("/offers");
			revalidatePath(`/offers/${offer.slug}`);
			if (existingOffer && existingOffer.slug !== offer.slug) {
				revalidatePath(`/offers/${existingOffer.slug}`);
			}
		} catch (err) {
			console.error("Failed to revalidate paths on update:", err);
		}

		return NextResponse.json(offer);
	} catch (error) {
		console.error("[API] PATCH /api/admin/offers/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to update offer" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/offers"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		const existingOffer = await prisma.offer.findUnique({
			where: { id },
			select: { imageUrl: true, galleryUrls: true, gallery: true },
		});

		if (existingOffer) {
			const galleryUrls = (
				(existingOffer.gallery as unknown as GalleryImage[]) || []
			)
				.map((item) => item.url)
				.filter(Boolean);
			const urlsToDelete = [
				existingOffer.imageUrl,
				...(existingOffer.galleryUrls || []),
				...galleryUrls,
			];
			await deleteStorageFiles(urlsToDelete);
		}

		const deletedOffer = await prisma.offer.delete({ where: { id } });
		try {
			revalidatePath("/");
			revalidatePath("/offers");
			revalidatePath(`/offers/${deletedOffer.slug}`);
		} catch (err) {
			console.error("Failed to revalidate paths on delete:", err);
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE /api/admin/offers/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to delete offer" },
			{ status: 500 },
		);
	}
}
