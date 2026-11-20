"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/types";

export function Gallery({ images, title = "Gallery" }: { images?: (GalleryImage | string)[] | null; title?: string }) {
	const list = (images ?? []).map((i) => (typeof i === "string" ? { url: i, title: "" } : i)).filter((i) => i.url);
	const [open, setOpen] = useState<number | null>(null);

	const step = useCallback(
		(d: number) => setOpen((n) => (n === null ? n : (n + d + list.length) % list.length)),
		[list.length],
	);

	useEffect(() => {
		if (open === null) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(null);
			if (e.key === "ArrowRight") step(1);
			if (e.key === "ArrowLeft") step(-1);
		};
		document.documentElement.style.overflow = "hidden";
		window.addEventListener("keydown", onKey);
		return () => {
			document.documentElement.style.overflow = "";
			window.removeEventListener("keydown", onKey);
		};
	}, [open, step]);

	if (list.length === 0) return null;

	return (
		<div className="mt-16">
			<h2 className="font-heading text-2xl font-semibold tracking-tight text-fg">{title}</h2>
			<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
				{list.map((img, i) => (
					<figure key={img.url} className="space-y-2">
						<button
							type="button"
							onClick={() => setOpen(i)}
							className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line"
							aria-label={`Open image ${i + 1}${img.title ? `: ${img.title}` : ""}`}
						>
							{/* biome-ignore lint/performance/noImgElement: arbitrary remote storage URLs */}
							<img src={img.url} alt={img.title || ""} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
							<span className="absolute inset-0 flex items-center justify-center bg-navy/0 text-white opacity-0 transition group-hover:bg-navy/40 group-hover:opacity-100">
								<Expand className="h-6 w-6" />
							</span>
						</button>
						{img.title && <figcaption className="text-sm text-fg-muted">{img.title}</figcaption>}
					</figure>
				))}
			</div>

			<AnimatePresence>
				{open !== null && (
					<motion.div
						role="dialog"
						aria-modal="true"
						aria-label="Image viewer"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgb(6_8_22/0.92)] p-4 backdrop-blur"
						onClick={() => setOpen(null)}
					>
						<button type="button" onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
							<X className="h-5 w-5" />
						</button>
						{list.length > 1 && (
							<>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										step(-1);
									}}
									aria-label="Previous image"
									className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
								>
									<ChevronLeft className="h-6 w-6" />
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										step(1);
									}}
									aria-label="Next image"
									className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
								>
									<ChevronRight className="h-6 w-6" />
								</button>
							</>
						)}
						<motion.figure
							key={open}
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							className="flex max-w-[86vw] flex-col items-center"
							onClick={(e) => e.stopPropagation()}
						>
							{/* biome-ignore lint/performance/noImgElement: arbitrary remote storage URLs */}
							<img src={list[open].url} alt={list[open].title || ""} className="max-h-[78vh] max-w-full rounded-xl object-contain" />
							<figcaption className="mt-4 text-center text-sm text-white/70">
								{list[open].title && <span className="mr-3 font-semibold text-white">{list[open].title}</span>}
								{open + 1} / {list.length}
							</figcaption>
						</motion.figure>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
