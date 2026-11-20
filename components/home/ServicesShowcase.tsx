"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Grade } from "@/components/site/Grade";
import { ButtonLink, SectionHeading, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { SERVICES_FALLBACK } from "@/lib/site";
import { type Offer, type ServiceView, toService } from "@/lib/types";

export function ServicesShowcase() {
	const { data, loading } = useApi<Offer[]>("/api/public/offers");
	const services: ServiceView[] =
		data && data.length > 0 ? data.slice(0, 4).map(toService) : SERVICES_FALLBACK;
	const [active, setActive] = useState(0);
	const current = services[Math.min(active, services.length - 1)];

	return (
		<section className="bg-surface py-24 sm:py-32">
			<div className="container-x">
				<div className="flex flex-wrap items-end justify-between gap-8">
					<SectionHeading
						title="Services"
						subtitle="What We Do"
						intro="Marine logistics is our core — vessels, port services and cargo — supported by consultancy and procurement for the oil & gas sector."
					/>
					<ButtonLink href="/services" variant="outline" className="hidden sm:inline-flex">
						All services <ArrowRight className="h-4 w-4" />
					</ButtonLink>
				</div>

				{loading ? (
					<div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
						<div className="space-y-4">
							<Skeleton className="h-40" />
							<Skeleton className="h-40" />
							<Skeleton className="h-40" />
						</div>
						<Skeleton className="h-[30rem]" />
					</div>
				) : (
					<div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
						{/* tiles */}
						<div className="flex flex-col gap-4" role="tablist" aria-label="Service divisions">
							{services.map((s, i) => (
								<button
									key={s.slug}
									type="button"
									role="tab"
									aria-selected={i === active}
									aria-controls="service-panel"
									onClick={() => setActive(i)}
									onMouseEnter={() => setActive(i)}
									data-graded
									className={cn(
										"group relative isolate h-36 overflow-hidden rounded-3xl text-left ring-2 transition-all duration-500 sm:h-44",
										i === active ? "ring-brand" : "ring-transparent",
									)}
								>
									<Image
										src={s.imageUrl}
										alt=""
										fill
										sizes="(min-width:1024px) 40vw, 100vw"
										className={cn(
											"-z-10 object-cover transition-transform duration-700",
											i === active ? "scale-105" : "scale-100 group-hover:scale-105",
										)}
									/>
									<Grade className="-z-10" />
									<div className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgb(12_16_40/0.85)] via-[rgb(12_16_40/0.45)] to-transparent" />
									<div className="flex h-full items-end justify-between gap-4 p-6 text-white">
										<div>
											<span className="font-heading text-xs font-semibold text-[#7fd8f7]">
												{String(i + 1).padStart(2, "0")}
											</span>
											<p className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-[1.7rem]">{s.name}</p>
										</div>
										<span
											className={cn(
												"flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all",
												i === active ? "bg-brand text-brand-contrast" : "bg-white/15",
											)}
										>
											<ArrowRight className="h-4 w-4" />
										</span>
									</div>
								</button>
							))}
						</div>

						{/* detail panel */}
						<div
							id="service-panel"
							role="tabpanel"
							className="relative overflow-hidden rounded-[2rem] bg-navy p-8 text-white sm:p-12"
						>
							<div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
							<AnimatePresence mode="wait">
								<motion.div
									key={current.slug}
									initial={{ opacity: 0, y: 24 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -16 }}
									transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
									className="relative"
								>
									<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7fd8f7]">
										{current.category}
									</p>
									<h3 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{current.name}</h3>
									<p className="mt-4 max-w-lg leading-relaxed text-white/70">{current.description}</p>
									{current.features.length > 0 && (
										<ul className="mt-8 grid gap-3 sm:grid-cols-2">
											{current.features.map((f, i) => (
												<motion.li
													key={f}
													initial={{ opacity: 0, x: -12 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: 0.1 + i * 0.05 }}
													className="flex gap-3 rounded-xl bg-white/5 p-3.5 text-[15px] leading-snug ring-1 ring-white/10"
												>
													<Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
													{f}
												</motion.li>
											))}
										</ul>
									)}
									<Link
										href={
											data && data.length > 0 ? `/services/${current.slug}` : "/services"
										}
										className="group mt-10 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-brand px-6 text-[15px] font-semibold text-brand-contrast transition hover:bg-[#4cc8f4]"
									>
										Explore {current.name.split(" ")[0]}
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Link>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
