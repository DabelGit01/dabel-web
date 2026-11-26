"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DabelLogo } from "@/components/brand/DabelLogo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { PUBLIC_ENDPOINTS, prefetchApi } from "@/hooks/use-api";
import { useIntroDone } from "@/hooks/use-intro";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/site";
import { useContent } from "@/components/site/ContentProvider";

/** Full-width header photos used by the inner pages (keep in sync with each page's PageHero). */

/**
 * Pre-download the optimised variant next/image will request for a full-width
 * (sizes="100vw", quality 85) image on this screen, so page headers appear instantly.
 */
function warmImages(srcs: string[]) {
	const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]; // next/image defaults
	const need = window.innerWidth * (window.devicePixelRatio || 1);
	const w = deviceSizes.find((s) => s >= need) ?? deviceSizes[deviceSizes.length - 1];
	for (const src of srcs) {
		const img = new window.Image();
		img.decoding = "async";
		img.src = `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=85`;
	}
}

export function Navbar() {
	const pathname = usePathname();
	const ready = useIntroDone();
	const g = useContent("global");
	// inner-page header photos (admin-editable) — joined so the effect below only re-runs when they change
	const heroImgs = [useContent("about").image, useContent("offers").image, useContent("insights").image, useContent("contact").image].join("|");
	const [scrolled, setScrolled] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		let last = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			setScrolled(y > 40);
			setHidden(y > 400 && y > last);
			last = y;
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Once the intro is done, quietly pre-load every page's data so navigation is instant.
	useEffect(() => {
		if (!ready) return;
		const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 800));
		idle(() => {
			prefetchApi(PUBLIC_ENDPOINTS);
			warmImages(heroImgs.split("|").filter(Boolean));
		});
	}, [ready, heroImgs]);

	useEffect(() => setOpen(false), [pathname]);
	useEffect(() => {
		document.documentElement.style.overflow = open ? "hidden" : "";
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	const isActive = (href: string) =>
		href === "/" ? pathname === "/" : pathname.startsWith(href);

	const solid = scrolled && !open;

	return (
		<>
			<header
				className={cn(
					"fixed inset-x-0 top-0 z-50 transition-all duration-500",
					ready ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
					hidden && !open && "-translate-y-full",
					solid
						? "border-b border-line bg-surface/80 text-fg shadow-[0_8px_30px_rgb(0_0_0/0.06)] backdrop-blur-xl"
						: "text-white",
				)}
			>
				<div className="container-x flex h-20 items-center justify-between gap-6">
					<DabelLogo tone={solid ? "auto" : "onDark"} />

					<nav aria-label="Primary" className="hidden items-center gap-9 text-sm font-medium lg:flex">
						{NAV_LINKS.map((l) => (
							<Link
								key={l.href}
								href={l.href}
								aria-current={isActive(l.href) ? "page" : undefined}
								className="group relative py-2"
							>
								<span className={cn("transition-opacity", isActive(l.href) ? "opacity-100" : "opacity-80 group-hover:opacity-100")}>
									{l.label}
								</span>
								<span
									className={cn(
										"absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-brand transition-transform duration-300",
										isActive(l.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
									)}
								/>
							</Link>
						))}
					</nav>

					<div className="flex items-center gap-2.5">
						<ThemeToggle />
						<Link
							href="/contact?subject=Request%20a%20quote"
							className="hidden min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-contrast transition hover:bg-[#4cc8f4] sm:inline-flex"
						>
							{g.navCtaLabel}
						</Link>
						<button
							type="button"
							onClick={() => setOpen((v) => !v)}
							aria-label={open ? "Close menu" : "Open menu"}
							aria-expanded={open}
							aria-controls="mobile-menu"
							className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-current/25 lg:hidden"
						>
							{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</button>
					</div>
				</div>
			</header>

			<AnimatePresence>
				{open && (
					<motion.div
						id="mobile-menu"
						initial={{ clipPath: "inset(0 0 100% 0)" }}
						animate={{ clipPath: "inset(0 0 0% 0)" }}
						exit={{ clipPath: "inset(0 0 100% 0)" }}
						transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1] }}
						className="fixed inset-0 z-40 flex flex-col bg-navy pt-24 text-white lg:hidden"
					>
						<nav aria-label="Mobile" className="container-x flex flex-1 flex-col gap-1">
							{NAV_LINKS.map((l, i) => (
								<motion.div
									key={l.href}
									initial={{ opacity: 0, y: 24 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
								>
									<Link
										href={l.href}
										className={cn(
											"flex items-center justify-between border-b border-white/10 py-4 font-heading text-4xl font-semibold tracking-tight",
											isActive(l.href) ? "text-brand" : "text-white",
										)}
									>
										{l.label}
										<ArrowUpRight className="h-6 w-6 opacity-50" />
									</Link>
								</motion.div>
							))}
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
