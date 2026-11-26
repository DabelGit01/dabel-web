"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Grade } from "@/components/site/Grade";
import { useIntroDone } from "@/hooks/use-intro";
import type { HeroSlideData } from "@/lib/content";

const SLIDE_MS = 6500;

/** Home hero. Slides are managed in Admin → Page Content → Hero Slides. */
export function HeroSlider({ slides }: { slides: HeroSlideData[] }) {
	const ready = useIntroDone();
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const touchX = useRef<number | null>(null);
	const count = slides.length;

	const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

	// Autoplay is driven by the active progress bar's CSS animation (see onAnimationEnd),
	// so hover/focus pause freezes bar and timing together. Off for reduced motion.
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	}, []);

	// pause while the tab is hidden
	useEffect(() => {
		const onVis = () => setPaused(document.hidden);
		document.addEventListener("visibilitychange", onVis);
		return () => document.removeEventListener("visibilitychange", onVis);
	}, []);

	if (count === 0) return null;
	const pad = (n: number) => String(n).padStart(2, "0");

	return (
		<section
			className="hero relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-navy-deep text-white"
			data-ready={ready}
			data-paused={paused}
			style={{ ["--slide-ms" as string]: `${SLIDE_MS}ms` }}
			aria-roledescription="carousel"
			aria-label="Dabel highlights"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocusCapture={() => setPaused(true)}
			onBlurCapture={() => setPaused(false)}
			onKeyDown={(e) => {
				if (e.key === "ArrowRight") go(index + 1);
				if (e.key === "ArrowLeft") go(index - 1);
			}}
			onTouchStart={(e) => {
				touchX.current = e.touches[0].clientX;
			}}
			onTouchEnd={(e) => {
				if (touchX.current === null) return;
				const dx = e.changedTouches[0].clientX - touchX.current;
				if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
				touchX.current = null;
			}}
		>
			{slides.map((s, i) => {
				const active = i === index;
				const lines = [s.line1, s.line2, s.line3].filter(Boolean);
				return (
					<div
						key={s.id}
						className="hero-slide"
						data-active={active}
						role="group"
						aria-roledescription="slide"
						aria-label={`${i + 1} of ${count}: ${s.label}`}
						aria-hidden={!active}
					>
						<div className="hero-media" data-graded="cover">
							{/* every slide loads up front (first one with high priority) so sliding never waits on a download */}
							<Image
								src={s.imageUrl}
								alt=""
								fill
								priority={i === 0}
								loading={i === 0 ? undefined : "eager"}
								fetchPriority={i === 0 ? "high" : "low"}
								quality={85}
								sizes="100vw"
								className="object-cover"
							/>
							<Grade variant="cover" />
						</div>
						<div
							className="pointer-events-none absolute inset-0"
							style={{ background: "radial-gradient(120% 100% at 60% 40%, transparent 55%, rgb(var(--overlay) / .55) 100%)" }}
						/>
						<div
							className="absolute inset-0"
							style={{
								background:
									"linear-gradient(90deg, rgb(var(--overlay) / .94) 0%, rgb(var(--overlay) / .62) 45%, rgb(var(--overlay) / .15) 100%)",
							}}
						/>
						<div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgb(var(--overlay)/0.85)] to-transparent" />

						<div className="container-x relative flex h-full flex-col justify-center pb-28 pt-28">
							<div className="max-w-3xl">
								{s.eyebrow && (
									<p className="fade-left flex items-center gap-3.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#7fd8f7]">
										<span className="h-0.5 w-11 bg-brand" />
										{s.eyebrow}
									</p>
								)}
								<h1 className="mt-6 font-heading text-[clamp(2.75rem,6.2vw,5.75rem)] font-bold leading-[0.98] tracking-[-0.035em]">
									{lines.map((line, li) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: headline lines are positional
										<span key={li} className="reveal-line">
											<span className={li + 1 === s.accentLine ? "text-brand" : undefined}>{line}</span>
										</span>
									))}
								</h1>
								{s.body && <p className="fade-up mt-7 max-w-xl text-lg leading-relaxed text-[#cdd3ea]">{s.body}</p>}
								{s.ctaLabel && (
									<div className="fade-up mt-9">
										<Link
											href={s.ctaHref || "/offers"}
											tabIndex={active ? 0 : -1}
											className="group inline-flex min-h-13 items-center gap-2.5 rounded-full bg-brand px-7 text-[15px] font-semibold text-brand-contrast transition hover:bg-[#4cc8f4]"
										>
											{s.ctaLabel}
											<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
										</Link>
									</div>
								)}
							</div>
						</div>
					</div>
				);
			})}

			{count > 1 && (
				<>
					{/* slide index (desktop) */}
					<div className="container-x pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 justify-end lg:flex">
						<div className="pointer-events-auto flex flex-col gap-1.5">
							{slides.map((s, i) => (
								<button
									key={s.id}
									type="button"
									onClick={() => go(i)}
									aria-label={`Show slide ${i + 1}: ${s.label}`}
									aria-current={i === index}
									className={`flex min-h-13 items-center justify-end gap-4 px-1 text-sm font-medium transition-colors ${
										i === index ? "text-white" : "text-white/50 hover:text-white/80"
									}`}
								>
									<span>{s.label}</span>
									<span className={`block h-[1.5px] transition-all duration-500 ${i === index ? "w-14 bg-brand" : "w-6 bg-current"}`} />
									<span className="font-heading text-xs">{pad(i + 1)}</span>
								</button>
							))}
						</div>
					</div>

					{/* bottom controls */}
					<div className="container-x absolute inset-x-0 bottom-10 z-10 flex items-center gap-6 sm:gap-8">
						<p className="whitespace-nowrap font-heading text-[15px] font-semibold tracking-[0.08em]" aria-live="polite">
							{pad(index + 1)} <span className="text-white/45">/ {pad(count)}</span>
						</p>
						<div className="flex max-w-md flex-1 gap-2.5">
							{slides.map((s, i) => (
								<span
									key={s.id}
									className="hero-progress h-[3px] flex-1 overflow-hidden rounded bg-white/20"
									data-state={i === index ? "active" : i < index ? "past" : "idle"}
								>
									<i
										key={i === index ? `a${index}` : "i"}
										onAnimationEnd={i === index && !reduced ? () => go(index + 1) : undefined}
									/>
								</span>
							))}
						</div>
						<div className="ml-auto flex gap-2">
							<button
								type="button"
								onClick={() => go(index - 1)}
								aria-label="Previous slide"
								className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/30 transition hover:bg-white hover:text-navy"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<button
								type="button"
								onClick={() => go(index + 1)}
								aria-label="Next slide"
								className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/30 transition hover:bg-white hover:text-navy"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						</div>
					</div>
				</>
			)}
		</section>
	);
}
