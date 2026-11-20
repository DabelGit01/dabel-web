import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
	fullName: z.string().min(2, "Full name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = signupSchema.safeParse(body);

		if (!parsed.success) {
			const errors = parsed.error.flatten().fieldErrors;
			const firstError =
				Object.values(errors)[0]?.[0] || "Invalid registration details";
			return NextResponse.json({ error: firstError }, { status: 400 });
		}

		const { fullName, email, password } = parsed.data;

		// Check if email already exists
		const existing = await prisma.admin.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (existing) {
			return NextResponse.json(
				{ error: "An admin with this email already exists" },
				{ status: 400 },
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create admin with permissions of none
		await prisma.admin.create({
			data: {
				fullName,
				email: email.toLowerCase(),
				password: hashedPassword,
				permissions: [], // permissions of none
			},
		});

		return NextResponse.json({
			success: true,
			message:
				"Admin account created successfully. Please contact a super admin to assign permissions.",
		});
	} catch (error) {
		console.error("[API] POST /api/admin/signup error:", error);
		return NextResponse.json(
			{ error: "Failed to register admin account" },
			{ status: 500 },
		);
	}
}
