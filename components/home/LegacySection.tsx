"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Compass, Target } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Grade } from "@/components/site/Grade";
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { ABOUT_FALLBACK } from "@/lib/site";
import type { SiteMeta } from "@/lib/types";

/** Brochure p.7 (History) + p.8 (Vision & Mission). Used on Home and About. */
export function LegacySection({ showVisionMission = true }: { showVisionMission?: boolean }) {
	const { data } = useApi<SiteMeta>("/api/public/site-meta");
	const meta = {
		aboutHistory: data?.aboutHistory || ABOUT_FALLBACK.aboutHistory,
		aboutVision: data?.aboutVision || ABOUT_FALLBACK.aboutVision,
		aboutMission: data?.aboutMission || ABOUT_FALLBACK.aboutMission,
	};
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
	const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

	return (
		<section className="bg-surface py-24 sm:py-32">
			<div className="container-x">
				<SectionHeading title="History" subtitle="Building a Legacy" />

				<div ref={ref} className="mt-14 grid overflow-hidden rounded-[2rem] lg:grid-cols-2">
					<div className="relative min-h-[22rem] overflow-hidden">
						<motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0" data-graded>
							<Image
								src="/images/about-tug-portrait.jpg"
								alt="Dabel tugboat moored at the jetty"
								fill
								sizes="(min-width:1024px) 50vw, 100vw"
								className="object-cover"
							/>
							<Grade />
						</motion.div>
						<div className="absolute bottom-5 left-5 rounded-full bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
							Since 2013
						</div>
					</div>
					<div className="relative bg-navy p-8 text-white sm:p-12 lg:p-14">
						<div className="absolute left-0 top-12 bottom-12 w-1 bg-brand" aria-hidden="true" />
						<Reveal>
							<p className="whitespace-pre-line text-lg leading-[1.9] text-white/85">{meta.aboutHistory}</p>
						</Reveal>
					</div>
				</div>

				{showVisionMission && (
					<div className="mt-20 grid gap-6 md:grid-cols-2">
						{[
							{ t: "Our Vision", body: meta.aboutVision, img: "/images/barge-tanks.jpg", Icon: Compass },
							{ t: "Our Mission", body: meta.aboutMission, img: "/images/cranes-lift.jpg", Icon: Target },
						].map((c, i) => (
							<Reveal key={c.t} delay={i * 0.1} as="article" className="group overflow-hidden rounded-[2rem] bg-bg ring-1 ring-line">
								<div className="relative aspect-[16/9] overflow-hidden" data-graded>
									<Image
										src={c.img}
										alt=""
										fill
										sizes="(min-width:768px) 50vw, 100vw"
										className="object-cover transition-transform duration-700 group-hover:scale-105"
									/>
									<Grade />
								</div>
								<div className="p-8 sm:p-10">
									<div className="flex items-center gap-3">
										<span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/15 text-brand-ink">
											<c.Icon className="h-5 w-5" />
										</span>
										<h3 className="font-heading text-2xl font-semibold tracking-tight text-fg">{c.t}</h3>
									</div>
									<p className="mt-5 text-lg leading-relaxed text-fg-muted">{c.body}</p>
								</div>
							</Reveal>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
