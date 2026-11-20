import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { STORAGE_BUCKET, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"]);
// folder/filename — lowercase folder, safe filename chars, no traversal
const PATH_RE = /^[a-z0-9-]{1,40}\/[A-Za-z0-9._-]{1,180}$/;

/** Admin-only image upload to Supabase Storage (service role, server-side). */
export async function POST(req: Request) {
	const session = await getSession();
	if (!session.admin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	if (!supabaseAdmin) {
		return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
	}

	const form = await req.formData().catch(() => null);
	const file = form?.get("file");
	const path = String(form?.get("path") ?? "");

	if (!(file instanceof File)) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}
	if (!PATH_RE.test(path) || path.includes("..")) {
		return NextResponse.json({ error: "Invalid path" }, { status: 400 });
	}
	if (!ALLOWED.has(file.type)) {
		return NextResponse.json({ error: "Only image files can be uploaded" }, { status: 415 });
	}
	if (file.size > MAX_BYTES) {
		return NextResponse.json({ error: "Image must be 10 MB or smaller" }, { status: 413 });
	}

	const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(path, file, {
		cacheControl: "3600",
		upsert: false,
		contentType: file.type,
	});
	if (error) {
		console.error("[upload] failed", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
	return NextResponse.json({ path, url: data.publicUrl });
}
