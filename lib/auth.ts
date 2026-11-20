import "server-only";
import { prisma } from "./prisma";
import { getSession } from "./session";

export async function getAuthenticatedAdmin() {
	try {
		const session = await getSession();
		return session.admin || null;
	} catch (error) {
		console.error("[AUTH] Error getting authenticated admin:", error);
		return null;
	}
}

export function hasPermission(admin: any, path: string): boolean {
	if (!admin) return false;

	const isSuperAdmin = admin.permissions.includes("*");
	if (isSuperAdmin) return true;

	if (path === "/admin") return true; // Everyone can access overview

	// Check if admin has exact or prefix permission
	return admin.permissions.some((p: string) => {
		if (p === path) return true;
		if (path.startsWith(`${p}/`)) return true;
		return false;
	});
}

export async function verifyAuth(
	requiredPermission?: string,
): Promise<boolean> {
	const session = await getSession();
	if (!session.admin?.id) return false;

	const dbAdmin = await prisma.admin.findUnique({
		where: { id: session.admin.id },
	});

	if (!dbAdmin) return false;

	if (requiredPermission) {
		return hasPermission(dbAdmin, requiredPermission);
	}

	return true;
}
