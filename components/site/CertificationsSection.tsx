"use client";

import { Award } from "lucide-react";
import Image from "next/image";
import { useContent } from "@/components/site/ContentProvider";
import { Reveal, SectionHeading, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import type { Certification } from "@/lib/types";

export function CertificationsSection({ limit, id }: { limit?: number; id?: string }) {
	const c = useContent("certifications");
	const { data, loading } = useApi<Certification[]>("/api/public/certifications");
	const certs = (data ?? []).slice(0, limit ?? 99);

	if (!loading && certs.length === 0) return null;

	return (
		<section id={id} className="scroll-mt-24 bg-surface py-24 sm:py-32">
			<div className="container-x">
				<SectionHeading title={c.title} subtitle={c.subtitle} intro={c.intro} />
				<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{loading
						? [0, 1, 2].map((n) => <Skeleton key={n} className="h-80 rounded-3xl" />)
						: certs.map((c, i) => (
								<Reveal key={c.id} delay={i * 0.08} as="article" className="group overflow-hidden rounded-3xl bg-bg ring-1 ring-line">
									<div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
										{c.imageUrl ? (
											<Image
												src={c.imageUrl}
												alt={c.title}
												fill
												sizes="(min-width:1024px) 33vw, 100vw"
												className="object-cover transition-transform duration-700 group-hover:scale-105"
											/>
										) : (
											<div className="flex h-full items-center justify-center text-brand-ink">
												<Award className="h-14 w-14" />
											</div>
										)}
									</div>
									<div className="p-6">
										<p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink">{c.year}</p>
										<h3 className="mt-2 font-heading text-xl font-semibold tracking-tight text-fg">{c.title}</h3>
										<p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-fg-muted">{c.description}</p>
									</div>
								</Reveal>
							))}
				</div>
			</div>
		</section>
	);
}
