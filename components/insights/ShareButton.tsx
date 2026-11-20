"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ title }: { title: string }) {
	async function share() {
		const url = window.location.href;
		if (navigator.share) {
			try {
				await navigator.share({ title, url });
			} catch {
				/* cancelled */
			}
			return;
		}
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Link copied to clipboard");
		} catch {
			toast.error("Couldn't copy the link");
		}
	}
	return (
		<button
			type="button"
			onClick={share}
			className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-fg ring-1 ring-line transition hover:ring-fg"
		>
			<Share2 className="h-4 w-4" /> Share
		</button>
	);
}
