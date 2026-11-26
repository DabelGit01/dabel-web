"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useContent } from "@/components/site/ContentProvider";
import { Grade } from "@/components/site/Grade";
import { SectionHeading } from "@/components/site/primitives";
import type { CoreValueData } from "@/lib/content";
import { cn } from "@/lib/utils";

const ROTATE_MS = 5500;

/** "Our Values | Guiding Principles". Values are managed in Admin → Page Content → Values. */
export function ValuesSection({ values, showImages = true }: { values: CoreValueData[]; showImages?: boolean }) {
	const c = useContent("homeValues");
	const [i, setI] = useState(0);
	const [hover, setHover] = useState(false);
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { margin: "-20%" });
	const v = values[Math.min(i, values.length - 1)];
	const images = showImages ? (v?.images ?? []).filter(Boolean) : [];

	useEffect(() => {
		if (!inView || hover || values.length < 2) return;
		const t = window.setTimeout(() => setI((n) => (n + 1) % values.length), ROTATE_MS);
		return () => clearTimeout(t);
	}, [i, inView, hover, values.length]);

	if (!v) return null;

	return (
		<section
			ref={ref}
			className="relative overflow-hidden bg-bg py-24 sm:py-32"
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			{/* brochure diagonal facets */}
			<div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-25">
				<div className="absolute -right-60 -top-80 h-[56rem] w-[56rem] rotate-45 bg-gradient-to-br from-surface to-transparent" />
				<div className="absolute -bottom-96 left-1/4 h-[44rem] w-[44rem] rotate-45 bg-gradient-to-br from-surface to-transparent" />
			</div>

			<div className="container-x relative">
				<div className="flex flex-wrap items-end justify-between gap-8">
					<SectionHeading title={c.title} subtitle={c.subtitle} />
					<div className="flex flex-wrap gap-2" role="tablist" aria-label="Values">
						{values.map((x, n) => (
							<button
								key={x.id}
								type="button"
								role="tab"
								aria-selected={n === i}
								onClick={() => setI(n)}
								className={cn(
									"relative min-h-11 overflow-hidden rounded-full px-5 text-sm font-semibold ring-1 transition",
									n === i
										? "bg-navy text-white ring-navy dark:bg-white dark:text-navy dark:ring-white"
										: "text-fg-muted ring-line hover:text-fg hover:ring-fg/40",
								)}
							>
								{x.name}
								{n === i && !hover && values.length > 1 && (
									<motion.span
										key={`bar-${i}`}
										className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand"
										initial={{ scaleX: 0 }}
										animate={{ scaleX: inView ? 1 : 0 }}
										transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
									/>
								)}
							</button>
						))}
					</div>
				</div>

				{images.length > 0 && (
					<div className={cn("mt-14 grid gap-4", images.length === 3 ? "sm:grid-cols-3" : images.length === 2 ? "sm:grid-cols-2" : "mx-auto max-w-4xl")}>
						<AnimatePresence mode="popLayout">
							{images.map((src, n) => (
								<motion.div
									key={`${v.id}-${src}-${n}`}
									initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
									animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
									exit={{ clipPath: "inset(100% 0 0 0)", opacity: 0.4 }}
									transition={{ duration: 0.8, delay: n * 0.1, ease: [0.77, 0, 0.18, 1] }}
									data-graded
									className={cn("relative overflow-hidden rounded-3xl", images.length === 1 ? "aspect-[16/9]" : "aspect-[16/10]")}
								>
									<Image
										src={src}
										alt=""
										fill
										sizes={images.length === 1 ? "(min-width:896px) 56rem, 100vw" : "(min-width:640px) 33vw, 100vw"}
										className="object-cover"
									/>
									<Grade />
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}

				<div className={cn("mx-auto max-w-2xl text-center", images.length > 0 ? "mt-12" : "mt-16")} aria-live="polite">
					<AnimatePresence mode="wait">
						<motion.div
							key={v.id}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -12 }}
							transition={{ duration: 0.4 }}
						>
							<h3 className="font-heading text-3xl font-semibold tracking-tight text-indigo">{v.name}</h3>
							<p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-fg-muted">{v.body}</p>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
