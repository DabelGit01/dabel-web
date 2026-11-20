"use client";

import { ArrowUpRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/site/PostCard";
import { Reveal, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { type BlogCategory, type BlogPost, excerpt, formatDate } from "@/lib/types";

const PER_PAGE = 6;

export function InsightsBrowser() {
	const { data: posts, loading } = useApi<BlogPost[]>("/api/public/blog");
	const { data: cats } = useApi<BlogCategory[]>("/api/public/blog-categories");
	const [cat, setCat] = useState("all");
	const [q, setQ] = useState("");
	const [page, setPage] = useState(1);

	const filtered = useMemo(() => {
		const term = q.trim().toLowerCase();
		return (posts ?? [])
			.filter((p) => p.published)
			.filter((p) => cat === "all" || p.categoryId === cat)
			.filter((p) => !term || p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term));
	}, [posts, cat, q]);

	const showFeatured = page === 1 && cat === "all" && !q && filtered.length > 0;
	const featured = showFeatured ? filtered[0] : null;
	const rest = showFeatured ? filtered.slice(1) : filtered;
	const pages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
	const shown = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	return (
		<section className="bg-bg py-20 sm:py-28">
			<div className="container-x">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
						{[{ id: "all", name: "All" }, ...(cats ?? [])].map((c) => (
							<button
								key={c.id}
								type="button"
								aria-pressed={c.id === cat}
								onClick={() => {
									setCat(c.id);
									setPage(1);
								}}
								className={cn(
									"min-h-11 rounded-full px-5 text-sm font-semibold ring-1 transition",
									c.id === cat
										? "bg-navy text-white ring-navy dark:bg-white dark:text-navy dark:ring-white"
										: "text-fg-muted ring-line hover:text-fg",
								)}
							>
								{c.name}
							</button>
						))}
					</div>
					<label className="relative block w-full lg:w-80">
						<span className="sr-only">Search insights</span>
						<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
						<input
							type="search"
							value={q}
							onChange={(e) => {
								setQ(e.target.value);
								setPage(1);
							}}
							placeholder="Search articles"
							className="min-h-12 w-full rounded-full bg-surface pl-11 pr-4 text-sm text-fg ring-1 ring-line placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-brand"
						/>
					</label>
				</div>

				{loading ? (
					<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[0, 1, 2].map((n) => (
							<Skeleton key={n} className="h-[26rem] rounded-3xl" />
						))}
					</div>
				) : filtered.length === 0 ? (
					<div className="mt-12 rounded-3xl bg-surface p-16 text-center ring-1 ring-line">
						<p className="font-heading text-2xl font-semibold text-fg">No articles yet</p>
						<p className="mt-2 text-fg-muted">{q ? "Try a different search." : "Check back soon for news from the Dabel team."}</p>
					</div>
				) : (
					<>
						{featured && (
							<Reveal className="mt-12">
								<Link
									href={`/insights/${featured.id}`}
									className="group grid overflow-hidden rounded-[2rem] bg-navy text-white lg:grid-cols-[1.3fr_1fr]"
								>
									<div className="relative min-h-72 overflow-hidden lg:min-h-[26rem]">
										<Image
											src={featured.imageUrl || "/images/port-traffic.jpg"}
											alt=""
											fill
											priority
											sizes="(min-width:1024px) 55vw, 100vw"
											className="object-cover transition-transform duration-700 group-hover:scale-105"
										/>
									</div>
									<div className="flex flex-col justify-center p-8 sm:p-12">
										<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7fd8f7]">
											Featured · {featured.category?.name}
										</p>
										<h2 className="mt-4 font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{featured.title}</h2>
										<p className="mt-4 leading-relaxed text-white/70">{excerpt(featured.content, 220)}</p>
										<p className="mt-6 text-sm text-white/55">
											{featured.authorName} · {formatDate(featured.createdAt)} · {featured.readTime}
										</p>
										<span className="mt-8 flex items-center gap-2 font-semibold text-brand">
											Read article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
										</span>
									</div>
								</Link>
							</Reveal>
						)}
						<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{shown.map((p, i) => (
								<Reveal key={p.id} delay={(i % 3) * 0.06} className="h-full">
									<PostCard post={p} />
								</Reveal>
							))}
						</div>
					</>
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
