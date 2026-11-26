"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { LogoMark } from "@/components/brand/DabelLogo";
import { useContent } from "@/components/site/ContentProvider";
import { Reveal } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { OFFICES_FALLBACK } from "@/lib/site";
import type { Office } from "@/lib/types";

/**
 * Brochure p.10 layout: brand card left, navy panel right with a cyan rule.
 * Heading/text: Page Content → Our Office. Addresses/phones/emails: Site Meta → Offices.
 */
export function OfficesSection() {
	const c = useContent("office");
	const { data } = useApi<Office[]>("/api/public/offices", OFFICES_FALLBACK);
	const offices = data ?? OFFICES_FALLBACK;

	return (
		<section className="bg-bg">
			<div className="grid lg:grid-cols-[1fr_1.15fr]">
				<div className="flex items-center justify-center px-6 py-20 sm:py-28">
					<Reveal className="w-full max-w-md rounded-[2rem] bg-white p-10 text-center shadow-[0_30px_80px_rgb(20_20_43/0.12)] ring-1 ring-line">
						<LogoMark tile={false} className="mx-auto h-32 w-32" />
						<p className="mt-6 font-heading text-2xl font-bold tracking-[0.04em] text-indigo">DABEL RESOURCES</p>
						<p className="mt-1 text-[11px] tracking-[0.42em] text-[#4a4f70]">VENTURES LIMITED</p>
						{c.cardText && <p className="mt-6 text-sm leading-relaxed text-[#4a4f70]">{c.cardText}</p>}
					</Reveal>
				</div>

				<div className="relative bg-navy px-6 py-20 text-white sm:px-14 sm:py-28 lg:px-20">
					<div className="absolute inset-y-0 left-0 w-2 bg-brand" aria-hidden="true" />
					<Reveal>
						<h2 className="font-heading text-[clamp(2.25rem,4vw,3.25rem)] font-bold tracking-[-0.03em]">{c.title}</h2>
					</Reveal>
					<div className="mt-12 grid gap-10 sm:grid-cols-2">
						{offices.map((o, i) => (
							<Reveal key={o.id} delay={0.1 + i * 0.08} className="space-y-4">
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7fd8f7]">{o.name}</p>
								<p className="flex gap-3 leading-relaxed text-white/85">
									<MapPin className="mt-1 h-4 w-4 shrink-0 text-brand" />
									{o.address}
								</p>
								{o.phone && (
									<a href={`tel:${o.phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 text-white/85 hover:text-white">
										<Phone className="h-4 w-4 shrink-0 text-brand" />
										{o.phone}
									</a>
								)}
								{o.email && (
									<a href={`mailto:${o.email}`} className="flex items-center gap-3 break-all text-white/85 hover:text-white">
										<Mail className="h-4 w-4 shrink-0 text-brand" />
										{o.email}
									</a>
								)}
							</Reveal>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
