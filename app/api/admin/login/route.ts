import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = loginSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 400 },
			);
		}

		const { email, password } = parsed.data;

		// Look up the admin user
		const admin = await prisma.admin.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (!admin) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, admin.password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		// Authorization: check if the admin has permissions assigned
		if (!admin.permissions || admin.permissions.length === 0) {
			return NextResponse.json(
				{
					error: "none",
					message:
						"This admin user has no permissions yet. Please contact the super admin to assign you permissions.",
				},
				{ status: 403 },
			);
		}

		// Save admin details to encrypted iron-session cookie
		const session = await getSession();
		session.admin = {
			id: admin.id,
			fullName: admin.fullName,
			email: admin.email,
			permissions: admin.permissions,
		};
		await session.save();

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] POST /api/admin/login error:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 500 },
		);
	}
}
