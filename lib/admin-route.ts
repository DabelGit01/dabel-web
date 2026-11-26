import "server-only";
import { invalidatePublic } from "@/lib/public-data";

/**
 * Wrap an admin mutation handler (POST/PATCH/PUT/DELETE) so that a successful
 * response clears the public content cache — admin edits show on the site at once.
 */
export function withInvalidate<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
	return async (...args: A): Promise<Response> => {
		const res = await handler(...args);
		if (res.ok) {
			try {
				invalidatePublic();
			} catch (err) {
				console.error("[admin] cache invalidation failed:", err);
			}
		}
		return res;
	};
}
