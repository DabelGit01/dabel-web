"use client";

import { Facebook, Globe, Instagram, Linkedin, type LucideIcon, Mail, Phone, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import { Grade } from "@/components/site/Grade";
import { Reveal, SectionHeading, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { ABOUT_FALLBACK, SITE } from "@/lib/site";
import type { SiteMeta, SocialLink, TeamMember } from "@/lib/types";

export function CompanyOverview() {
	const { data, loading } = useApi<SiteMeta>("/api/public/site-meta");
	const header = data?.aboutHeader || "Integrated marine logistics, procurement & environmental solutions";
	const body = data?.aboutBody || `${ABOUT_FALLBACK.welcomeBody1}\n\n${ABOUT_FALLBACK.welcomeBody2}`;

	return (
		<section className="bg-bg py-24 sm:py-32">
			<div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
				<div>
					<SectionHeading title="About Us" subtitle="Who We Are" />
					<Reveal delay={0.1}>
						<p className="mt-8 font-heading text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-tight tracking-tight text-fg">
							{header}
						</p>
					</Reveal>
					<Reveal delay={0.15} className="mt-6 space-y-5 text-lg leading-[1.8] text-fg-muted">
						{loading ? (
							<div className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
							</div>
						) : (
							body.split(/\n{2,}/).map((p) => <p key={p.slice(0, 24)}>{p}</p>)
						)}
					</Reveal>
				</div>
				<Reveal delay={0.1} className="grid grid-cols-2 gap-4">
					<div className="relative row-span-2 overflow-hidden rounded-[2rem]" data-graded>
						<Image src="/images/about-tug-portrait.jpg" alt="Dabel tugboat moored at the jetty" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
						<Grade />
					</div>
					<div className="relative aspect-square overflow-hidden rounded-[2rem]" data-graded>
						<Image src="/images/crew-briefing.jpg" alt="Dabel crew safety briefing in the field" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
						<Grade />
					</div>
					<div className="flex aspect-square flex-col justify-end rounded-[2rem] bg-navy p-6 text-white">
						<p className="font-heading text-5xl font-bold">{SITE.founded}</p>
						<p className="mt-2 text-sm text-white/70">Founded &amp; registered with CAC — {SITE.rcNumber}</p>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

export function FounderSection() {
	const { data } = useApi<SiteMeta>("/api/public/site-meta");
	if (!data?.founderBio?.trim()) return null;

	return (
		<section className="bg-bg py-24 sm:py-32">
			<div className="container-x">
				<SectionHeading title="Leadership" subtitle="Our Founder" />
				<div className="mt-14 grid items-center gap-12 lg:grid-cols-[0.9fr_1.3fr]">
					<Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-surface-2">
						{data.founderImageUrl && (
							<Image src={data.founderImageUrl} alt={data.founderName} fill sizes="(min-width:1024px) 38vw, 90vw" className="object-cover" />
						)}
					</Reveal>
					<Reveal delay={0.1}>
						<h3 className="font-heading text-4xl font-semibold tracking-tight text-fg">{data.founderName}</h3>
						<p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-brand-ink">{data.founderRole}</p>
						<p className="mt-8 whitespace-pre-line text-lg leading-[1.85] text-fg-muted">{data.founderBio}</p>
					</Reveal>
				</div>
			</div>
		</section>
	);
}

export function LeadershipTeam() {
	const { data, loading } = useApi<TeamMember[]>("/api/public/team");
	const members = data ?? [];
	if (!loading && members.length === 0) return null;

	return (
		<section className="bg-surface py-24 sm:py-32">
			<div className="container-x">
				<SectionHeading title="Our Team" subtitle="The People Behind Dabel" />
				<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{loading
						? [0, 1, 2, 3].map((n) => <Skeleton key={n} className="aspect-[4/5] rounded-3xl" />)
						: members.map((m, i) => (
								<Reveal key={m.id} delay={i * 0.06} as="article" className="group">
									<div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-2">
										{m.imageUrl ? (
											<Image
												src={m.imageUrl}
												alt={m.name}
												fill
												sizes="(min-width:1024px) 25vw, 50vw"
												className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
											/>
										) : (
											<div className="flex h-full items-center justify-center font-heading text-5xl font-bold text-fg-muted/40">
												{m.name
													.split(" ")
													.map((n) => n[0])
													.join("")
													.slice(0, 2)}
											</div>
										)}
										{m.linkedin && (
											<a
												href={m.linkedin}
												target="_blank"
												rel="noopener noreferrer"
												aria-label={`${m.name} on LinkedIn`}
												className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy opacity-0 transition group-hover:opacity-100 focus:opacity-100"
											>
												<Linkedin className="h-4 w-4" />
											</a>
										)}
									</div>
									<h3 className="mt-4 font-heading text-lg font-semibold text-fg">{m.name}</h3>
									<p className="text-sm text-brand-ink">{m.title || m.role}</p>
								</Reveal>
							))}
				</div>
			</div>
		</section>
	);
}

function socialIcon(platform: string): LucideIcon {
	const p = platform.toLowerCase();
	if (p.includes("facebook")) return Facebook;
	if (p.includes("linkedin")) return Linkedin;
	if (p.includes("twitter") || p === "x") return Twitter;
	if (p.includes("instagram")) return Instagram;
	if (p.includes("youtube")) return Youtube;
	if (p.includes("phone") || p.includes("whatsapp")) return Phone;
	if (p.includes("mail")) return Mail;
	return Globe;
}

export function SocialHandles() {
	const { data } = useApi<SocialLink[]>("/api/public/socials");
	const socials = (data ?? []).filter((s) => s.published !== false);
	if (socials.length === 0) return null;

	return (
		<section className="bg-bg py-20">
			<div className="container-x flex flex-col items-center gap-8 text-center">
				<SectionHeading title="Connect" subtitle="Follow Dabel" align="center" />
				<div className="flex flex-wrap justify-center gap-4">
					{socials.map((s) => {
						const Icon = socialIcon(s.platform);
						return (
							<a
								key={s.id}
								href={s.url}
								target={s.url.startsWith("mailto") ? undefined : "_blank"}
								rel="noopener noreferrer"
								aria-label={s.platform}
								className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-fg ring-1 ring-line transition hover:-translate-y-1 hover:bg-brand hover:text-brand-contrast hover:ring-brand"
							>
								<Icon className="h-6 w-6" />
							</a>
						);
					})}
				</div>
			</div>
		</section>
	);
}
