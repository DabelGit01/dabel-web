"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContent } from "@/components/site/ContentProvider";
import { Grade } from "@/components/site/Grade";
import { ButtonLink, Reveal, SectionHeading, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { SERVICES_FALLBACK } from "@/lib/site";
import { type Offer, type ServiceView, toService } from "@/lib/types";

/** Home "Offers | What We Do": first 3 published offers from the admin + one button to /offers. */
export function ServicesShowcase() {
	const c = useContent("homeOffers");
	const { data, loading } = useApi<Offer[]>("/api/public/offers");
	const fromAdmin = !!data && data.length > 0;
	const offers: ServiceView[] = (fromAdmin ? data.map(toService) : SERVICES_FALLBACK).slice(0, 3);

	return (
		<section className="bg-surface py-24 sm:py-32">
			<div className="container-x">
				<SectionHeading title={c.title} subtitle={c.subtitle} intro={c.intro} />

				<div className="mt-14 grid gap-6 md:grid-cols-3">
					{loading
						? [0, 1, 2].map((n) => <Skeleton key={n} className="h-[26rem] rounded-3xl" />)
						: offers.map((s, i) => (
								<Reveal key={s.slug} delay={i * 0.08} className="h-full">
									<Link
										href={fromAdmin ? `/offers/${s.slug}` : "/offers"}
										className="group flex h-full flex-col overflow-hidden rounded-3xl bg-bg ring-1 ring-line transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgb(20_20_43/0.12)]"
									>
										<div className="relative aspect-[4/3] overflow-hidden" data-graded>
											<Image
												src={s.imageUrl}
												alt=""
												fill
												sizes="(min-width:768px) 33vw, 100vw"
												className="object-cover transition-transform duration-700 group-hover:scale-105"
											/>
											<Grade />
											<span className="absolute left-5 top-5 rounded-full bg-navy/80 px-3 py-1.5 font-heading text-xs font-semibold text-white backdrop-blur">
												{String(i + 1).padStart(2, "0")}
											</span>
										</div>
										<div className="flex flex-1 flex-col p-7">
											<p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink">{s.category}</p>
											<h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-fg">{s.name}</h3>
											<p className="mt-3 line-clamp-3 leading-relaxed text-fg-muted">{s.description}</p>
											<span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand-ink">
												Learn more
												<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
											</span>
										</div>
									</Link>
								</Reveal>
							))}
				</div>

				{c.buttonLabel && (
					<Reveal delay={0.2} className="mt-12 flex justify-center">
						<ButtonLink href="/offers" variant="solid">
							{c.buttonLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</ButtonLink>
					</Reveal>
				)}
			</div>
		</section>
	);
}
