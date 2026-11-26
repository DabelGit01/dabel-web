"use client";

import { Compass, Target } from "lucide-react";
import { useContent } from "@/components/site/ContentProvider";
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { ABOUT_FALLBACK } from "@/lib/site";
import type { SiteMeta } from "@/lib/types";

/**
 * About page: History (brochure p.7) + Vision & Mission (p.8), text only.
 * Text: Admin → Site Meta → Landing. Headings: Admin → Page Content → About page.
 */
export function LegacySection() {
	const c = useContent("about");
	const { data } = useApi<SiteMeta>("/api/public/site-meta");
	const history = data?.aboutHistory || ABOUT_FALLBACK.aboutHistory;
	const vision = data?.aboutVision || ABOUT_FALLBACK.aboutVision;
	const mission = data?.aboutMission || ABOUT_FALLBACK.aboutMission;

	return (
		<section className="bg-surface py-24 sm:py-32">
			<div className="container-x">
				<SectionHeading title={c.historyTitle} subtitle={c.historySubtitle} />

				<Reveal className="relative mt-14 overflow-hidden rounded-[2rem] bg-navy p-8 text-white sm:p-12 lg:p-16">
					<div className="absolute bottom-12 left-0 top-12 w-1 bg-brand" aria-hidden="true" />
					<div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
					<p className="relative max-w-4xl whitespace-pre-line text-lg leading-[1.9] text-white/85 sm:text-xl">{history}</p>
				</Reveal>

				<div className="mt-16 grid gap-6 md:grid-cols-2">
					{[
						{ t: c.visionTitle, body: vision, Icon: Compass },
						{ t: c.missionTitle, body: mission, Icon: Target },
					].map((x, i) => (
						<Reveal key={x.t} delay={i * 0.1} as="article" className="rounded-[2rem] bg-bg p-8 ring-1 ring-line sm:p-10">
							<div className="flex items-center gap-3">
								<span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-brand-ink">
									<x.Icon className="h-5 w-5" />
								</span>
								<h3 className="font-heading text-2xl font-semibold tracking-tight text-fg">{x.t}</h3>
							</div>
							<p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-fg-muted">{x.body}</p>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
