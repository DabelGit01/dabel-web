import { ArrowLeft, ArrowRight, Check, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/site/Gallery";
import { PageHero } from "@/components/site/primitives";
import { prisma } from "@/lib/prisma";
import { ABOUT_FALLBACK, SITE } from "@/lib/site";
import type { GalleryImage } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getOffer(raw: string) {
	const slug = decodeURIComponent(raw);
	try {
		return (
			(await prisma.offer.findUnique({ where: { slug } })) ??
			(await prisma.offer.findFirst({ where: { OR: [{ slug: `${slug}.` }, { slug: raw }] } }))
		);
	} catch (err) {
		console.error("[services/[slug]] lookup failed", err);
		return null;
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const offer = await getOffer(slug);
	if (!offer) return { title: "Service not found" };
	return {
		title: offer.name,
		description: offer.description.slice(0, 160),
		openGraph: {
			title: offer.name,
			description: offer.description.slice(0, 160),
			images: offer.imageUrl ? [{ url: offer.imageUrl }] : undefined,
		},
	};
}

export default async function ServiceDetailPage({ params }: Props) {
	const { slug } = await params;
	const offer = await getOffer(slug);
	if (!offer?.published) notFound();

	const [meta, contacts] = await Promise.all([
		prisma.siteMeta.findFirst().catch(() => null),
		prisma.contactDetail.findMany({ orderBy: { order: "asc" } }).catch(() => []),
	]);
	const phone = contacts.find((c) => c.platform.toLowerCase() === "phone");
	const email = contacts.find((c) => ["mail", "email"].includes(c.platform.toLowerCase()));

	const features = (Array.isArray(offer.features) ? offer.features : []) as (
		| { title: string; description: string }
		| string
	)[];
	const gallery = (Array.isArray(offer.gallery) ? offer.gallery : []) as unknown as GalleryImage[];
	const galleryAll = gallery.length > 0 ? gallery : offer.galleryUrls.map((url) => ({ url, title: "" }));

	return (
		<>
			<PageHero
				eyebrow={offer.category}
				title={offer.name}
				body={offer.subTopic || undefined}
				image={offer.imageUrl || "/images/tanker.jpg"}
				crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: offer.name }]}
			/>

			<section className="bg-bg py-20 sm:py-28">
				<div className="container-x grid gap-14 lg:grid-cols-[1.5fr_1fr]">
					<div>
						<Link href="/services" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-fg-muted hover:text-fg">
							<ArrowLeft className="h-4 w-4" /> All services
						</Link>

						{offer.imageUrl && (
							<div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[2rem] bg-surface-2">
								<Image src={offer.imageUrl} alt={offer.name} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
							</div>
						)}

						<h2 className="mt-12 font-heading text-3xl font-semibold tracking-tight text-fg">Overview</h2>
						<p className="mt-5 whitespace-pre-line text-lg leading-[1.85] text-fg-muted">{offer.description}</p>

						{features.length > 0 && (
							<>
								<h2 className="mt-14 font-heading text-3xl font-semibold tracking-tight text-fg">Scope of service</h2>
								<ul className="mt-6 grid gap-4 sm:grid-cols-2">
									{features.map((f) => {
										const t = typeof f === "string" ? f : f.title;
										const d = typeof f === "string" ? "" : f.description;
										return (
											<li key={t} className="rounded-2xl bg-surface p-6 ring-1 ring-line">
												<div className="flex gap-3">
													<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-ink">
														<Check className="h-4 w-4" />
													</span>
													<div>
														<p className="font-heading text-lg font-semibold text-fg">{t}</p>
														{d && <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">{d}</p>}
													</div>
												</div>
											</li>
										);
									})}
								</ul>
							</>
						)}

						<Gallery images={galleryAll} title="Project gallery" />
					</div>

					<aside className="lg:sticky lg:top-28 lg:self-start">
						<div className="relative overflow-hidden rounded-[2rem] bg-navy p-8 text-white sm:p-10">
							<div className="absolute inset-y-10 left-0 w-1 bg-brand" aria-hidden="true" />
							<h2 className="font-heading text-2xl font-semibold tracking-tight">For more enquiries</h2>
							<p className="mt-4 leading-relaxed text-white/70">{meta?.enquiryText || ABOUT_FALLBACK.enquiryText}</p>
							<div className="mt-8 space-y-3 text-sm">
								<a href={phone?.url || `tel:${SITE.phones[0].replace(/\s/g, "")}`} className="flex items-center gap-3 text-white/85 hover:text-white">
									<Phone className="h-4 w-4 text-brand" /> {phone?.value || SITE.phones[0]}
								</a>
								<a href={email?.url || `mailto:${SITE.emails[0]}`} className="flex items-center gap-3 break-all text-white/85 hover:text-white">
									<Mail className="h-4 w-4 text-brand" /> {email?.value || SITE.emails[0]}
								</a>
							</div>
							<Link
								href={`/contact?subject=${encodeURIComponent("Request a quote")}&service=${encodeURIComponent(offer.name)}`}
								className="group mt-8 flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-brand px-6 font-semibold text-brand-contrast transition hover:bg-[#4cc8f4]"
							>
								Request this service
								<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Link>
						</div>
					</aside>
				</div>
			</section>
		</>
	);
}
