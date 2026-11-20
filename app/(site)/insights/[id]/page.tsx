import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButton } from "@/components/insights/ShareButton";
import { Gallery } from "@/components/site/Gallery";
import { PageHero } from "@/components/site/primitives";
import { prisma } from "@/lib/prisma";
import { type GalleryImage, excerpt, formatDate } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function getPost(id: string) {
	try {
		const post = await prisma.blogPost.findUnique({ where: { id }, include: { category: true } });
		return post?.published ? post : null;
	} catch (err) {
		console.error("[insights/[id]] lookup failed", err);
		return null;
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const post = await getPost(id);
	if (!post) return { title: "Article not found" };
	const description = excerpt(post.content, 155);
	return {
		title: post.title,
		description,
		openGraph: {
			type: "article",
			title: post.title,
			description,
			images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
		},
	};
}

export default async function InsightPage({ params }: Props) {
	const { id } = await params;
	const post = await getPost(id);
	if (!post) notFound();

	const related = await prisma.blogPost
		.findMany({
			where: { published: true, categoryId: post.categoryId, NOT: { id: post.id } },
			orderBy: { createdAt: "desc" },
			take: 3,
			select: { id: true, title: true, createdAt: true, imageUrl: true },
		})
		.catch(() => []);

	const gallery = (Array.isArray(post.gallery) ? post.gallery : []) as unknown as GalleryImage[];
	const galleryAll = gallery.length > 0 ? gallery : post.galleryUrls.map((url) => ({ url, title: "" }));
	const created = post.createdAt.toISOString();

	return (
		<>
			<PageHero
				eyebrow={post.category?.name ?? "Insight"}
				title={post.title}
				image={post.imageUrl || "/images/port-traffic.jpg"}
				crumbs={[{ label: "Home", href: "/" }, { label: "Insights", href: "/insights" }, { label: "Article" }]}
			/>

			<article className="bg-bg py-16 sm:py-24">
				<div className="container-x max-w-4xl">
					<div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-8">
						<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
							<span className="font-semibold text-fg">{post.authorName}</span>
							<time dateTime={created}>{formatDate(created)}</time>
							<span className="flex items-center gap-1.5">
								<Clock className="h-4 w-4" /> {post.readTime}
							</span>
						</div>
						<ShareButton title={post.title} />
					</div>

					{post.imageUrl && (
						<div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[2rem] bg-surface-2">
							<Image src={post.imageUrl} alt="" fill sizes="(min-width:1024px) 56rem, 100vw" className="object-cover" />
						</div>
					)}

					<div className="mt-12 space-y-6 text-lg leading-[1.9] text-fg-muted">
						{post.content
							.split(/\n{2,}/)
							.filter(Boolean)
							.map((para, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: paragraphs of static text
								<p key={i} className="whitespace-pre-line first:text-xl first:text-fg">
									{para}
								</p>
							))}
					</div>

					<Gallery images={galleryAll} />

					<div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
						<Link href="/insights" className="inline-flex min-h-11 items-center gap-2 font-semibold text-fg hover:text-brand-ink">
							<ArrowLeft className="h-4 w-4" /> Back to insights
						</Link>
						<ShareButton title={post.title} />
					</div>

					{related.length > 0 && (
						<div className="mt-20">
							<h2 className="font-heading text-2xl font-semibold tracking-tight text-fg">More in {post.category?.name}</h2>
							<ul className="mt-6 divide-y divide-line rounded-3xl bg-surface ring-1 ring-line">
								{related.map((r) => (
									<li key={r.id}>
										<Link href={`/insights/${r.id}`} className="flex items-center justify-between gap-6 p-6 transition hover:bg-surface-2">
											<span className="font-heading text-lg font-semibold text-fg">{r.title}</span>
											<span className="shrink-0 text-sm text-fg-muted">{formatDate(r.createdAt.toISOString())}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</article>
		</>
	);
}
