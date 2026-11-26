import { withInvalidate } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAdmin, verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createPermissionSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	path: z
		.string()
		.min(1, "Path must be at least 1 character")
		.startsWith("/admin", "Path must start with /admin"),
});

async function authorizePermissionsManagement(requiredPermission?: string) {
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
		const authorizer = await authorizePermissionsManagement();
		if (!authorizer) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const permissions = await prisma.permission.findMany({
			orderBy: {
				name: "asc",
			},
		});

		return NextResponse.json(permissions);
	} catch (error) {
		console.error("[API] GET /api/admin/permissions error:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve permissions" },
			{ status: 500 },
		);
	}
}

async function POSTHandler(request: Request) {
	try {
		const authorizer = await authorizePermissionsManagement("/admin/admins");
		if (!authorizer) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await request.json();
		const parsed = createPermissionSchema.safeParse(body);

		if (!parsed.success) {
			const errors = parsed.error.flatten().fieldErrors;
			const firstError =
				Object.values(errors)[0]?.[0] || "Invalid permission details";
			return NextResponse.json({ error: firstError }, { status: 400 });
		}

		const { name, path } = parsed.data;

		// Check if permission already exists by name or path
		const existingName = await prisma.permission.findUnique({
			where: { name },
		});
		const existingPath = await prisma.permission.findUnique({
			where: { path },
		});

		if (existingName || existingPath) {
			return NextResponse.json(
				{ error: "Permission with this Name or Path already exists" },
				{ status: 400 },
			);
		}

		const created = await prisma.permission.create({
			data: {
				name,
				path,
			},
		});

		return NextResponse.json(created);
	} catch (error) {
		console.error("[API] POST /api/admin/permissions error:", error);
		return NextResponse.json(
			{ error: "Failed to create permission" },
			{ status: 500 },
		);
	}
}

async function DELETEHandler(request: Request) {
	try {
		const authorizer = await authorizePermissionsManagement("/admin/admins");
		if (!authorizer) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Permission ID is required" },
				{ status: 400 },
			);
		}

		// Fetch the permission to make sure we don't delete standard core ones if we want protection,
		// but we can allow deletion. Let's make sure the ID exists.
		const permission = await prisma.permission.findUnique({ where: { id } });
		if (!permission) {
			return NextResponse.json(
				{ error: "Permission not found" },
				{ status: 404 },
			);
		}

		// Prevent deleting Admin Management permission to prevent lockouts
		if (permission.path === "/admin/admins") {
			return NextResponse.json(
				{ error: "Cannot delete the core Admin Management permission" },
				{ status: 400 },
			);
		}

		await prisma.permission.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: "Permission deleted successfully",
		});
	} catch (error) {
		console.error("[API] DELETE /api/admin/permissions error:", error);
		return NextResponse.json(
			{ error: "Failed to delete permission" },
			{ status: 500 },
		);
	}
}

export const POST = withInvalidate(POSTHandler);
export const DELETE = withInvalidate(DELETEHandler);
