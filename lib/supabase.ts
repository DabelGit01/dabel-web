import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service-role key.
 * Only import from route handlers / server code — never from client components.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "dabel-media";

export const supabaseAdmin =
	url && serviceKey
		? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
		: null;

export async function deleteStorageFiles(urls: (string | null | undefined)[]): Promise<boolean> {
	if (!urls || urls.length === 0 || !supabaseAdmin) return false;

	try {
		const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
		const paths = urls
			.filter((u): u is string => !!u && u.includes(marker))
			.map((u) => decodeURIComponent(u.split(marker)[1]))
			.filter(Boolean);

		if (paths.length === 0) return false;

		const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).remove(paths);
		if (error) {
			console.error(`Failed to delete storage files ${paths.join(", ")}:`, error);
			return false;
		}
		return true;
	} catch (error) {
		console.error("Error deleting storage files:", error);
		return false;
	}
}

export async function deleteStorageFile(url: string | null | undefined): Promise<boolean> {
	return deleteStorageFiles([url]);
}
