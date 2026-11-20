import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAdmin, verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Schema for updating permissions
const updatePermissionsSchema = z.object({
	id: z.string().min(1, "Admin ID is required"),
	permissions: z.array(z.string()),
});

async function authorizeAdminsManagement(requiredPermission?: string) {
	const currentAdmin = await getAuthenticatedAdmin();
	if (!currentAdmin) return null;

	if (requiredPermission) {
		const isAllowed = await verifyAuth(requiredPermission);
		if (!isAllowed) return null;
	} else {
		const isAuthed = await verifyAuth();
		if (!isAuthed) return null;
	}

	return currentAdmin;
}

export async function GET() {
	try {
		const authorizer = await authorizeAdminsManagement();
		if (!authorizer) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Retrieve all admins (excluding their passwords)
		const admins = await prisma.admin.findMany({
			select: {
				id: true,
				fullName: true,
				email: true,
				permissions: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		return NextResponse.json(admins);
	} catch (error) {
		console.error("[API] GET /api/admin/admins error:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve admin users" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: Request) {
	try {
		const authorizer = await authorizeAdminsManagement("/admin/admins");
		if (!authorizer) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await request.json();
		const parsed = updatePermissionsSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid update payload" },
				{ status: 400 },
			);
		}

		const { id, permissions } = parsed.data;

		// Fetch target admin
		const targetAdmin = await prisma.admin.findUnique({
			where: { id },
		});

		if (!targetAdmin) {
			return NextResponse.json(
				{ error: "Admin user not found" },
				{ status: 404 },
			);
		}

		// Prevent modifying the superadmin's permissions
		if (targetAdmin.permissions.includes("*")) {
			return NextResponse.json(
				{ error: "Cannot modify permissions of the Super Admin" },
				{ status: 400 },
			);
		}

		// Update target admin's permissions
		const updated = await prisma.admin.update({
			where: { id },
			data: {
				permissions,
			},
			select: {
				id: true,
				fullName: true,
				email: true,
				permissions: true,
			},
		});

		return NextResponse.json(updated);
	} catch (error) {
		console.error("[API] PUT /api/admin/admins error:", error);
		return NextResponse.json(
			{ error: "Failed to update admin permissions" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const authorizer = await authorizeAdminsManagement("/admin/admins");
		if (!authorizer) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Admin ID is required" },
				{ status: 400 },
			);
		}

		// Fetch the target admin
		const targetAdmin = await prisma.admin.findUnique({
			where: { id },
		});

		if (!targetAdmin) {
			return NextResponse.json(
				{ error: "Admin user not found" },
				{ status: 404 },
			);
		}

		// Prevent deleting the Super Admin
		if (targetAdmin.permissions.includes("*")) {
			return NextResponse.json(
				{ error: "Cannot delete the Super Admin" },
				{ status: 400 },
			);
		}

		// Prevent deleting oneself
		if (targetAdmin.id === authorizer.id) {
			return NextResponse.json(
				{ error: "Cannot delete your own admin account" },
				{ status: 400 },
			);
		}

		await prisma.admin.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: "Admin user deleted successfully",
		});
	} catch (error) {
		console.error("[API] DELETE /api/admin/admins error:", error);
		return NextResponse.json(
			{ error: "Failed to delete admin user" },
			{ status: 500 },
		);
	}
}
