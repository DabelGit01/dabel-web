import { getIronSession } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type SessionData, sessionOptions } from "./lib/session";

// Minimal cookie store shape compatible with iron-session's expected interface
type CookieStore = {
	get(name: string): { name: string; value: string } | undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	set(
		...args:
			| [string, string, ...any[]]
			| [{ name: string; value: string; [key: string]: any }]
	): void;
	delete(name: string): void;
};

export async function proxy(request: NextRequest) {
	const path = request.nextUrl.pathname;

	const isPublicAdminPath =
		path === "/admin/login" ||
		path === "/admin/signup" ||
		path === "/api/admin/login" ||
		path === "/api/admin/signup" ||
		path === "/api/admin/logout";

	const isApiRoute = path.startsWith("/api/");

	const session = await getIronSession<SessionData>(
		request.cookies as unknown as CookieStore,
		sessionOptions,
	);
	const admin = session.admin;

	// 1. If no session and it's a private admin route:
	if (!admin && !isPublicAdminPath) {
		if (isApiRoute) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}

	// 2. If session is present:
	if (admin) {
		const isSuper = admin.permissions.includes("*");

		if (
			isPublicAdminPath &&
			(path === "/admin/login" || path === "/admin/signup")
		) {
			return NextResponse.redirect(new URL("/admin", request.url));
		}

		// Dynamic Page Authorization Check:
		if (!isPublicAdminPath && !isApiRoute) {
			if (path !== "/admin" && !isSuper) {
				const hasAccess = admin.permissions.some(
					(p: string) => path === p || path.startsWith(`${p}/`),
				);
				if (!hasAccess) {
					return NextResponse.redirect(new URL("/admin", request.url));
				}
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/api/admin/:path*"],
};
