import { ArrowUpRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Grade } from "@/components/site/Grade";
import { type BlogPost, excerpt, formatDate } from "@/lib/types";

export function PostCard({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
	return (
		<Link
			href={`/insights/${post.id}`}
			className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-line transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgb(20_20_43/0.12)]"
		>
			<div className="relative aspect-[16/10] overflow-hidden bg-surface-2" data-graded>
				<Image
					src={post.imageUrl || "/images/port-traffic.jpg"}
					alt=""
					fill
					priority={priority}
					sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
					className="object-cover transition-transform duration-700 group-hover:scale-105"
				/>
				<Grade />
				{post.category && (
					<span className="absolute left-4 top-4 rounded-full bg-navy/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
						{post.category.name}
					</span>
				)}
			</div>
			<div className="flex flex-1 flex-col p-6">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
					<span>{formatDate(post.createdAt)}</span>
					<span className="flex items-center gap-1.5">
						<Clock className="h-3.5 w-3.5" />
						{post.readTime}
					</span>
				</div>
				<h3 className="mt-3 font-heading text-xl font-semibold leading-snug tracking-tight text-fg transition-colors group-hover:text-brand-ink">
					{post.title}
				</h3>
				<p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-fg-muted">{excerpt(post.content)}</p>
				<span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand-ink">
					Read article
					<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
				</span>
			</div>
		</Link>
	);
}
