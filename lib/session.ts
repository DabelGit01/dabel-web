import "server-only";
import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
	admin?: {
		id: string;
		fullName: string;
		email: string;
		permissions: string[];
	};
}

const sessionPassword = process.env.SESSION_COOKIE_PASSWORD || "";

export const sessionOptions = {
	password: sessionPassword,
	cookieName: "ADMIN_SESSION",
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax" as const,
		path: "/",
		// 7 days
		maxAge: 60 * 60 * 24 * 7,
	},
};

export async function getSession(): Promise<IronSession<SessionData>> {
	const cookieStore = await cookies();
	const session = await getIronSession<SessionData>(
		cookieStore,
		sessionOptions,
	);
	return session;
}
