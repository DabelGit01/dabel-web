import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const subscribeSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = subscribeSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { email } = parsed.data;

		// Check if already subscribed
		const existing = await prisma.newsletterSubscriber.findUnique({
			where: { email },
		});

		if (existing) {
			return NextResponse.json(
				{ error: "Email is already subscribed!" },
				{ status: 400 },
			);
		}

		await prisma.newsletterSubscriber.create({
			data: { email },
		});

		return NextResponse.json({ success: true }, { status: 201 });
	} catch (error) {
		console.error("[API] POST /api/newsletter error:", error);
		return NextResponse.json(
			{ error: "Failed to subscribe. Please try again later." },
			{ status: 500 },
		);
	}
}
