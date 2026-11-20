"use client";

import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/site/PostCard";
import { ButtonLink, Reveal, SectionHeading, Skeleton } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import type { BlogPost } from "@/lib/types";

export function InsightsTeaser() {
	const { data, loading } = useApi<BlogPost[]>("/api/public/blog");
	const posts = (data ?? []).filter((p) => p.published).slice(0, 3);

	if (!loading && posts.length === 0) return null;

	return (
		<section className="bg-bg py-24 sm:py-32">
			<div className="container-x">
				<div className="flex flex-wrap items-end justify-between gap-8">
					<SectionHeading title="Insights" subtitle="News & Updates" intro="Operations updates, safety notes and industry news from the Dabel team." />
					<ButtonLink href="/insights" variant="outline">
						All insights <ArrowRight className="h-4 w-4" />
					</ButtonLink>
				</div>
				<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{loading
						? [0, 1, 2].map((n) => <Skeleton key={n} className="h-[26rem] rounded-3xl" />)
						: posts.map((p, i) => (
								<Reveal key={p.id} delay={i * 0.08} className="h-full">
									<PostCard post={p} />
								</Reveal>
							))}
				</div>
			</div>
		</section>
	);
}
