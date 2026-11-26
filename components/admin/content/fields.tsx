"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { storageClient } from "@/lib/storage-client";
import { cn } from "@/lib/utils";

export const inputCls =
	"w-full rounded-xl bg-bg px-3.5 py-2.5 text-sm text-fg ring-1 ring-line placeholder:text-fg-muted/60 transition focus:outline-none focus:ring-2 focus:ring-brand";

export function Field({
	label,
	help,
	children,
	className,
	group = false,
}: {
	label: string;
	help?: string;
	children: React.ReactNode;
	className?: string;
	/** true when children contain buttons (e.g. ImageField) — renders a div instead of a <label> */
	group?: boolean;
}) {
	const Tag = group ? "div" : "label";
	return (
		<Tag className={cn("block space-y-1.5", className)}>
			<span className="block text-xs font-semibold uppercase tracking-[0.12em] text-fg-muted">{label}</span>
			{children}
			{help && <span className="block text-xs text-fg-muted/80">{help}</span>}
		</Tag>
	);
}

/** Upload an image to Supabase (via /api/admin/upload) and return its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
	if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
	if (file.size > 10 * 1024 * 1024) throw new Error("Image must be 10 MB or smaller");
	const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
	const base =
		file.name
			.replace(/\.[^/.]+$/, "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.slice(0, 40) || "image";
	const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
	const { error } = await storageClient.storage.from("dabel-media").upload(path, file);
	if (error) throw error;
	return storageClient.storage.from("dabel-media").getPublicUrl(path).data.publicUrl;
}

/** Image picker: preview, upload, replace, clear, or paste a URL. */
export function ImageField({
	value,
	onChange,
	folder,
	aspect = "aspect-[16/9]",
	allowClear = true,
}: {
	value: string;
	onChange: (url: string) => void;
	folder: string;
	aspect?: string;
	allowClear?: boolean;
}) {
	const ref = useRef<HTMLInputElement>(null);
	const [busy, setBusy] = useState(false);

	async function pick(file?: File) {
		if (!file) return;
		setBusy(true);
		try {
			onChange(await uploadImage(file, folder));
			toast.success("Image uploaded — remember to save.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setBusy(false);
			if (ref.current) ref.current.value = "";
		}
	}

	return (
		<div className="space-y-2">
			<div className={cn("relative overflow-hidden rounded-xl bg-surface-2 ring-1 ring-line", aspect)}>
				{value ? (
					// biome-ignore lint/performance/noImgElement: admin preview of arbitrary URLs
					<img src={value} alt="" className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full items-center justify-center text-xs text-fg-muted">No image</div>
				)}
				{busy && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
						<Loader2 className="h-6 w-6 animate-spin" />
					</div>
				)}
			</div>
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => ref.current?.click()}
					disabled={busy}
					className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-semibold text-white transition hover:bg-indigo disabled:opacity-60 dark:bg-white dark:text-navy"
				>
					<ImagePlus className="h-3.5 w-3.5" /> {value ? "Replace" : "Upload"}
				</button>
				{allowClear && value && (
					<button
						type="button"
						onClick={() => onChange("")}
						className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-fg-muted ring-1 ring-line hover:text-destructive"
					>
						<Trash2 className="h-3.5 w-3.5" /> Remove
					</button>
				)}
				<input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
			</div>
		</div>
	);
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			className="inline-flex items-center gap-2.5 text-sm font-medium text-fg"
		>
			<span className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-brand" : "bg-surface-2 ring-1 ring-line")}>
				<span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
			</span>
			{label}
		</button>
	);
}

export const btnPrimary =
	"inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-contrast transition hover:bg-[#4cc8f4] disabled:opacity-60";
export const btnGhost =
	"inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-fg ring-1 ring-line transition hover:ring-fg/40 disabled:opacity-60";
export const card = "rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6";
