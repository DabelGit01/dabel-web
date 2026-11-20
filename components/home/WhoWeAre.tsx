"use client";

import { animate, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Grade } from "@/components/site/Grade";
import { ButtonLink, Reveal, SectionHeading, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { ABOUT_FALLBACK, SITE, yearsInOperation } from "@/lib/site";
import type { SiteMeta } from "@/lib/types";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true });
	const [v, setV] = useState(0);
	useEffect(() => {
		if (!inView) return;
		const c = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (n) => setV(Math.round(n)) });
		return () => c.stop();
	}, [inView, to]);
	return (
		<span ref={ref}>
			{v}
			{suffix}
		</span>
	);
}

export function WhoWeAre() {
	const { data, loading } = useApi<SiteMeta>("/api/public/site-meta");
	const meta = { ...ABOUT_FALLBACK, ...(data ?? {}) };

	return (
		<section className="relative overflow-hidden bg-bg py-24 sm:py-32">
			<div className="container-x grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
				{/* image — brochure p.2 layout: photo left, copy right */}
				<Reveal className="relative">
					<div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/5]" data-graded>
						<Image
							src="/images/tug-angel-vi.jpg"
							alt="Dabel tugboat MV Dabel Angel VI on the creek"
							fill
							sizes="(min-width:1024px) 45vw, 100vw"
							className="object-cover"
						/>
						<Grade />
					</div>
					<div className="absolute -bottom-8 right-4 w-56 rounded-2xl bg-surface p-5 shadow-[0_24px_60px_rgb(20_20_43/0.18)] ring-1 ring-line sm:-right-6 sm:w-64">
						<p className="font-heading text-5xl font-bold tracking-tight text-fg">
							<CountUp to={yearsInOperation()} />
							<span className="text-brand">+</span>
						</p>
						<p className="mt-1 text-sm text-fg-muted">Years serving the energy &amp; maritime sectors</p>
					</div>
				</Reveal>

				<div>
					<SectionHeading title="About Us" subtitle="Who We Are" />
					<Reveal delay={0.1} className="mt-8 space-y-5 text-lg leading-[1.8] text-fg-muted">
						{loading ? (
							<div className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-11/12" />
								<Skeleton className="h-4 w-4/5" />
							</div>
						) : (
							<>
								<p>
									{meta.welcomeBody1.split(SITE.name).map((part, i, arr) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: text fragments
										<span key={i}>
											{part}
											{i < arr.length - 1 && <strong className="font-semibold text-fg">{SITE.name}</strong>}
										</span>
									))}
								</p>
								<p>{meta.welcomeBody2}</p>
							</>
						)}
					</Reveal>

					<Reveal delay={0.2} className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-3">
						{[
							{ k: `Est. ${SITE.founded}`, v: "Founded in Rivers State" },
							{ k: SITE.rcNumber, v: "Registered with CAC" },
							{ k: "SPDC · Unilever", v: "Trusted partners" },
						].map((s) => (
							<div key={s.k} className="bg-surface p-5 last:col-span-2 sm:last:col-span-1">
								<p className="font-heading text-lg font-semibold text-fg">{s.k}</p>
								<p className="mt-1 text-sm text-fg-muted">{s.v}</p>
							</div>
						))}
					</Reveal>

					<Reveal delay={0.3} className="mt-10 flex flex-wrap gap-3">
						<ButtonLink href="/about" variant="solid">
							More about us
						</ButtonLink>
						<ButtonLink href="/services" variant="outline">
							Our services
						</ButtonLink>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
