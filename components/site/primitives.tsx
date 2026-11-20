"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Grade } from "@/components/site/Grade";
import { useIntroDone } from "@/hooks/use-intro";
import { cn } from "@/lib/utils";

const ease = [0.2, 0.8, 0.2, 1] as const;

/** Fade/slide in when scrolled into view. */
export function Reveal({
	children,
	className,
	delay = 0,
	y = 28,
	as = "div",
}: {
	children: ReactNode;
	className?: string;
	delay?: number;
	y?: number;
	as?: "div" | "li" | "article" | "section";
}) {
	const M = motion[as];
	return (
		<M
			className={className}
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.9, ease, delay }}
		>
			{children}
		</M>
	);
}

export const stagger: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.08 } },
};
export const rise: Variants = {
	hidden: { opacity: 0, y: 30 },
	show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

/**
 * Brochure heading pattern: "About Us | Who We Are".
 * Title in brand cyan, divider, subtitle in foreground.
 */
export function SectionHeading({
	title,
	subtitle,
	intro,
	align = "left",
	tone = "auto",
	className,
}: {
	title: string;
	subtitle?: string;
	intro?: ReactNode;
	align?: "left" | "center";
	tone?: "auto" | "onDark";
	className?: string;
}) {
	return (
		<Reveal
			className={cn(
				"flex flex-col gap-5",
				align === "center" && "items-center text-center",
				className,
			)}
		>
			<h2 className="flex flex-wrap items-center gap-x-5 gap-y-2 font-heading">
				<span
					className={cn(
						"text-[clamp(2rem,4vw,3.25rem)] font-bold leading-none tracking-[-0.03em]",
						tone === "onDark" ? "text-brand" : "text-brand-ink",
					)}
				>
					{title}
				</span>
				{subtitle && (
					<>
						<span className="h-[0.9em] w-[3px] self-stretch bg-brand text-[clamp(2rem,4vw,3.25rem)]" aria-hidden="true" />
						<span
							className={cn(
								"text-[clamp(1.35rem,2.4vw,2rem)] font-semibold tracking-[-0.02em]",
								tone === "onDark" ? "text-white" : "text-fg",
							)}
						>
							{subtitle}
						</span>
					</>
				)}
			</h2>
			{intro && (
				<div
					className={cn(
						"max-w-2xl text-base leading-relaxed sm:text-lg",
						tone === "onDark" ? "text-white/70" : "text-fg-muted",
					)}
				>
					{intro}
				</div>
			)}
		</Reveal>
	);
}

/** Dark image band used at the top of every inner page (keeps the nav legible). */
export function PageHero({
	eyebrow,
	title,
	accent,
	body,
	image,
	crumbs,
}: {
	eyebrow: string;
	title: string;
	accent?: string;
	body?: string;
	image: string;
	crumbs: { label: string; href?: string }[];
}) {
	const ready = useIntroDone();
	return (
		<section className="relative isolate overflow-hidden bg-navy-deep pb-20 pt-40 text-white sm:pb-28 sm:pt-48">
			<motion.div
				className="absolute inset-0 -z-10"
				data-graded="cover"
				initial={{ scale: 1.12 }}
				animate={ready ? { scale: 1 } : {}}
				transition={{ duration: 6, ease: "easeOut" }}
			>
				<Image src={image} alt="" fill priority quality={85} sizes="100vw" className="object-cover" />
				<Grade variant="cover" />
			</motion.div>
			<div
				className="absolute inset-0 -z-10"
				style={{
					background:
						"linear-gradient(90deg, rgb(var(--overlay) / .95) 0%, rgb(var(--overlay) / .7) 55%, rgb(var(--overlay) / .35) 100%)",
				}}
			/>
			<div className="container-x">
				<motion.nav
					aria-label="Breadcrumb"
					initial={{ opacity: 0 }}
					animate={ready ? { opacity: 1 } : {}}
					transition={{ duration: 0.6 }}
					className="mb-8 text-sm text-white/60"
				>
					<ol className="flex flex-wrap items-center gap-2">
						{crumbs.map((c, i) => (
							<li key={c.label} className="flex items-center gap-2">
								{i > 0 && <span aria-hidden="true">/</span>}
								{c.href ? (
									<Link href={c.href} className="hover:text-white">
										{c.label}
									</Link>
								) : (
									<span className="text-white" aria-current="page">
										{c.label}
									</span>
								)}
							</li>
						))}
					</ol>
				</motion.nav>
				<motion.p
					initial={{ opacity: 0, x: -20 }}
					animate={ready ? { opacity: 1, x: 0 } : {}}
					transition={{ duration: 0.7, delay: 0.1, ease }}
					className="flex items-center gap-3.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#7fd8f7]"
				>
					<span className="h-0.5 w-11 bg-brand" />
					{eyebrow}
				</motion.p>
				<h1 className="mt-6 max-w-4xl font-heading text-[clamp(2.5rem,5.5vw,4.75rem)] font-bold leading-[1] tracking-[-0.035em]">
					<span className="block overflow-hidden pb-[0.06em]">
						<motion.span
							className="block"
							initial={{ y: "110%" }}
							animate={ready ? { y: 0 } : {}}
							transition={{ duration: 1, delay: 0.25, ease }}
						>
							{title}
						</motion.span>
					</span>
					{accent && (
						<span className="block overflow-hidden pb-[0.06em]">
							<motion.span
								className="block text-brand"
								initial={{ y: "110%" }}
								animate={ready ? { y: 0 } : {}}
								transition={{ duration: 1, delay: 0.38, ease }}
							>
								{accent}
							</motion.span>
						</span>
					)}
				</h1>
				{body && (
					<motion.p
						initial={{ opacity: 0, y: 16 }}
						animate={ready ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.8, delay: 0.6 }}
						className="mt-7 max-w-2xl text-lg leading-relaxed text-[#cdd3ea]"
					>
						{body}
					</motion.p>
				)}
			</div>
		</section>
	);
}

export function Skeleton({ className }: { className?: string }) {
	return <div className={cn("animate-pulse rounded-lg bg-surface-2", className)} />;
}

export function ButtonLink({
	href,
	children,
	variant = "brand",
	className,
}: {
	href: string;
	children: ReactNode;
	variant?: "brand" | "outline" | "solid";
	className?: string;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[15px] font-semibold transition",
				variant === "brand" && "bg-brand text-brand-contrast hover:bg-[#4cc8f4]",
				variant === "solid" && "bg-navy text-white hover:bg-indigo dark:bg-white dark:text-navy dark:hover:bg-brand",
				variant === "outline" && "text-fg ring-[1.5px] ring-line ring-inset hover:ring-fg",
				className,
			)}
		>
			{children}
		</Link>
	);
}
