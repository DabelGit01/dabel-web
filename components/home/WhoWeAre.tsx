"use client";

import { useContent } from "@/components/site/ContentProvider";
import { ButtonLink, Reveal, SectionHeading, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { ABOUT_FALLBACK } from "@/lib/site";
import type { SiteMeta } from "@/lib/types";

/**
 * Home "About Us | Who We Are" write-up.
 * Statement + paragraphs: Admin → Site Meta → Landing (welcome title & body).
 * Headings, facts and button: Admin → Page Content → Home / About.
 */
export function WhoWeAre() {
	const c = useContent("homeAbout");
	const { data, loading } = useApi<SiteMeta>("/api/public/site-meta");
	const statement = data?.welcomeTitle || ABOUT_FALLBACK.welcomeTitle;
	const paragraphs = [data?.welcomeBody1 || ABOUT_FALLBACK.welcomeBody1, data?.welcomeBody2 || ABOUT_FALLBACK.welcomeBody2].filter(
		(p) => p?.trim(),
	);
	const facts = [
		[c.stat1Value, c.stat1Label],
		[c.stat2Value, c.stat2Label],
		[c.stat3Value, c.stat3Label],
	].filter(([v]) => v?.trim());

	return (
		<section className="relative overflow-hidden bg-bg py-24 sm:py-32">
			<div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
				<div>
					<SectionHeading title={c.title} subtitle={c.subtitle} />
					<Reveal delay={0.1}>
						{loading ? (
							<div className="mt-10 space-y-3">
								<Skeleton className="h-9 w-full" />
								<Skeleton className="h-9 w-3/4" />
							</div>
						) : (
							<p className="mt-10 font-heading text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-fg">
								{statement}
							</p>
						)}
					</Reveal>
				</div>

				<div className="lg:pt-24">
					<Reveal delay={0.15} className="space-y-5 text-lg leading-[1.8] text-fg-muted">
						{loading ? (
							<div className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-11/12" />
								<Skeleton className="h-4 w-4/5" />
							</div>
						) : (
							paragraphs.map((p) => (
								<p key={p.slice(0, 32)} className="whitespace-pre-line">
									{p}
								</p>
							))
						)}
					</Reveal>

					{facts.length > 0 && (
						<Reveal
							delay={0.2}
							className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-3"
						>
							{facts.map(([v, l]) => (
								<div key={v} className="bg-surface p-5 last:col-span-2 sm:last:col-span-1">
									<p className="font-heading text-lg font-semibold text-fg">{v}</p>
									<p className="mt-1 text-sm text-fg-muted">{l}</p>
								</div>
							))}
						</Reveal>
					)}

					{c.buttonLabel && (
						<Reveal delay={0.3} className="mt-10">
							<ButtonLink href="/about" variant="solid">
								{c.buttonLabel}
							</ButtonLink>
						</Reveal>
					)}
				</div>
			</div>
		</section>
	);
}
