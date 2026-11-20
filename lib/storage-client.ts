"use client";

/**
 * Browser-side stand-in for `supabase.storage` used by the admin screens.
 * Same call shape (`.storage.from(bucket).upload(path, file)` / `.getPublicUrl(path)`),
 * but uploads go through the authenticated `/api/admin/upload` route, so the
 * service-role key never reaches the browser and no public write policy is needed.
 */
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "dabel-media";

type UploadResult = { data: { path: string } | null; error: Error | null };

const bucketApi = {
	async upload(path: string, file: File, _opts?: unknown): Promise<UploadResult> {
		try {
			const body = new FormData();
			body.append("file", file);
			body.append("path", path);
			const res = await fetch("/api/admin/upload", { method: "POST", body });
			const json = await res.json().catch(() => ({}));
			if (!res.ok) return { data: null, error: new Error(json.error || `Upload failed (${res.status})`) };
			return { data: { path: json.path }, error: null };
		} catch (err) {
			return { data: null, error: err instanceof Error ? err : new Error("Upload failed") };
		}
	},
	getPublicUrl(path: string) {
		return {
			data: { publicUrl: `${BASE}/storage/v1/object/public/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}` },
		};
	},
};

export const storageClient = {
	storage: {
		// bucket argument kept for call-site compatibility; uploads always target BUCKET
		from(_bucket: string) {
			return bucketApi;
		},
	},
};
