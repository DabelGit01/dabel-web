"use client";

import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Grade } from "@/components/site/Grade";
import { Reveal, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { SERVICES_FALLBACK } from "@/lib/site";
import { type Offer, type ServiceView, toService } from "@/lib/types";

const PER_PAGE = 6;

export function ServicesList() {
	const { data, loading } = useApi<Offer[]>("/api/public/offers");
	const fromAdmin = !!data && data.length > 0;
	const all: ServiceView[] = fromAdmin ? data.map(toService) : SERVICES_FALLBACK;
	const categories = useMemo(() => ["All", ...Array.from(new Set(all.map((s) => s.category)))], [all]);
	const [cat, setCat] = useState("All");
	const [page, setPage] = useState(1);

	const filtered = cat === "All" ? all : all.filter((s) => s.category === cat);
	const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
	const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	return (
		<section className="bg-bg py-20 sm:py-28">
			<div className="container-x">
				{categories.length > 2 && (
					<div className="mb-12 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
						{categories.map((c) => (
							<button
								key={c}
								type="button"
								aria-pressed={c === cat}
								onClick={() => {
									setCat(c);
									setPage(1);
								}}
								className={cn(
									"min-h-11 rounded-full px-5 text-sm font-semibold ring-1 transition",
									c === cat
										? "bg-navy text-white ring-navy dark:bg-white dark:text-navy dark:ring-white"
										: "text-fg-muted ring-line hover:text-fg",
								)}
							>
								{c}
							</button>
						))}
					</div>
				)}

				{loading ? (
					<div className="space-y-8">
						<Skeleton className="h-96 rounded-[2rem]" />
						<Skeleton className="h-96 rounded-[2rem]" />
					</div>
				) : (
					<div className="space-y-8">
						{shown.map((s, i) => {
							const href = fromAdmin ? `/services/${s.slug}` : `/contact?subject=${encodeURIComponent(s.name)}`;
							return (
								<Reveal
									key={s.slug}
									as="article"
									className="group grid overflow-hidden rounded-[2rem] bg-surface ring-1 ring-line lg:grid-cols-2"
								>
									<div className={cn("relative min-h-72 overflow-hidden", i % 2 === 1 && "lg:order-2")} data-graded>
										<Image
											src={s.imageUrl}
											alt=""
											fill
											sizes="(min-width:1024px) 50vw, 100vw"
											className="object-cover transition-transform duration-700 group-hover:scale-105"
										/>
										<Grade />
										<span className="absolute left-6 top-6 rounded-full bg-navy/80 px-4 py-2 font-heading text-sm font-semibold text-white backdrop-blur">
											{String((page - 1) * PER_PAGE + i + 1).padStart(2, "0")}
										</span>
									</div>
									<div className="flex flex-col p-8 sm:p-12">
										<p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ink">{s.category}</p>
										<h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{s.name}</h2>
										{s.subTopic && <p className="mt-2 text-lg italic text-fg-muted">{s.subTopic}</p>}
										<p className="mt-5 leading-relaxed text-fg-muted">{s.description}</p>
										{s.features.length > 0 && (
											<ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
												{s.features.slice(0, 6).map((f) => (
													<li key={f} className="flex gap-2.5 text-[15px] leading-snug text-fg">
														<Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
														{f}
													</li>
												))}
											</ul>
										)}
										<div className="mt-auto pt-10">
											<Link
												href={href}
												className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-navy px-6 text-[15px] font-semibold text-white transition hover:bg-indigo dark:bg-white dark:text-navy dark:hover:bg-brand"
											>
												{fromAdmin ? "View service" : "Enquire"}
												<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
											</Link>
										</div>
									</div>
								</Reveal>
							);
						})}
					</div>
				)}

				{pages > 1 && (
					<nav aria-label="Pagination" className="mt-14 flex justify-center gap-2">
						{Array.from({ length: pages }, (_, n) => n + 1).map((n) => (
							<button
								key={n}
								type="button"
								aria-current={n === page ? "page" : undefined}
								onClick={() => {
									setPage(n);
									window.scrollTo({ top: 420, behavior: "smooth" });
								}}
								className={cn(
									"h-11 w-11 rounded-full text-sm font-semibold ring-1 transition",
									n === page ? "bg-brand text-brand-contrast ring-brand" : "text-fg ring-line hover:ring-fg",
								)}
							>
								{n}
							</button>
						))}
					</nav>
				)}
			</div>
		</section>
	);
}
