"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ImageGalleryProps {
	images?: string[] | { url: string; title: string }[] | null;
}

export function ImageGallery({ images }: ImageGalleryProps) {
	const [activeIdx, setActiveIdx] = useState<number | null>(null);

	// Safe check: if no images are provided or the array is empty, render nothing.
	if (!images || images.length === 0) {
		return null;
	}

	// Normalize images to always be objects with url and title
	const normalizedImages = images.map((img) => {
		if (typeof img === "string") {
			return { url: img, title: "" };
		}
		return img;
	});

	const openLightbox = (idx: number) => {
		setActiveIdx(idx);
	};

	const closeLightbox = () => {
		setActiveIdx(null);
	};

	const showNext = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (activeIdx !== null) {
			setActiveIdx((activeIdx + 1) % normalizedImages.length);
		}
	};

	const showPrev = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (activeIdx !== null) {
			setActiveIdx(
				(activeIdx - 1 + normalizedImages.length) % normalizedImages.length,
			);
		}
	};

	// Close on Escape, navigate with Arrow keys
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (activeIdx === null) return;
			if (e.key === "Escape") closeLightbox();
			if (e.key === "ArrowRight") showNext();
			if (e.key === "ArrowLeft") showPrev();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeIdx, showPrev, showNext, closeLightbox]);

	return (
		<div className="space-y-6 mt-12 pt-8 border-t border-black/5">
			<h3 className="font-['Playfair_Display'] text-2xl font-black uppercase tracking-tight text-[#001a3d]">
				Image Gallery
			</h3>

			{/* Responsive Grid */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{normalizedImages.map((img, idx) => (
					<div key={idx} className="flex flex-col gap-2">
						<div
							onClick={() => openLightbox(idx)}
							className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-black/5 bg-slate-100 cursor-pointer shadow-sm transition-all duration-300 hover:shadow-md"
						>
							<img
								src={img.url}
								alt={img.title || `Gallery Image ${idx + 1}`}
								className="object-cover h-full w-full transform transition-transform duration-500 group-hover:scale-105"
							/>
							{/* Hover overlay */}
							<div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
								<span className="bg-white/90 text-[#001a3d] font-['JetBrains_Mono'] text-xs font-bold px-3 py-1.5 rounded-md shadow-sm uppercase tracking-wider">
									View Image
								</span>
							</div>
						</div>
						{img.title && (
							<p className="font-['JetBrains_Mono'] text-[0.68rem] font-bold text-[#001a3d] uppercase tracking-wider text-center line-clamp-1 px-1">
								{img.title}
							</p>
						)}
					</div>
				))}
			</div>

			{/* Lightbox Modal */}
			{activeIdx !== null && (
				<div
					onClick={closeLightbox}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity duration-300"
				>
					{/* Close Button */}
					<button
						onClick={closeLightbox}
						className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
						aria-label="Close Lightbox"
					>
						<X className="h-6 w-6" />
					</button>

					{/* Navigation Left */}
					{normalizedImages.length > 1 && (
						<button
							onClick={showPrev}
							className="absolute left-4 z-50 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
							aria-label="Previous Image"
						>
							<ChevronLeft className="h-6 w-6" />
						</button>
					)}

					{/* Active Image */}
					<div className="relative max-w-[85vw] max-h-[80vh] flex flex-col items-center">
						<img
							src={normalizedImages[activeIdx].url}
							alt={
								normalizedImages[activeIdx].title ||
								`Active Gallery Image ${activeIdx + 1}`
							}
							onClick={(e) => e.stopPropagation()}
							className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
						/>
						{normalizedImages[activeIdx].title && (
							<h4 className="mt-4 text-white font-['Playfair_Display'] text-lg font-bold text-center">
								{normalizedImages[activeIdx].title}
							</h4>
						)}
						{/* Image Count/Indicator */}
						<span
							className={`${normalizedImages[activeIdx].title ? "mt-1" : "mt-4"} text-white/50 font-['JetBrains_Mono'] text-[0.65rem] uppercase tracking-wider font-bold`}
						>
							Image {activeIdx + 1} of {normalizedImages.length}
						</span>
					</div>

					{/* Navigation Right */}
					{normalizedImages.length > 1 && (
						<button
							onClick={showNext}
							className="absolute right-4 z-50 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
							aria-label="Next Image"
						>
							<ChevronRight className="h-6 w-6" />
						</button>
					)}
				</div>
			)}
		</div>
	);
}
