import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactView } from "@/components/contact/ContactView";
import { OfficesSection } from "@/components/site/OfficesSection";
import { PageHero } from "@/components/site/primitives";
import { getContent } from "@/lib/public-data";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Contact",
	description:
		"Contact Dabel Resources Ventures Limited — head office on Egweme Road, Rivers State and our jetty at Gbalajam, Woji.",
};

export default async function ContactPage() {
	const c = (await getContent()).contact;
	return (
		<>
			<PageHero
				eyebrow={c.eyebrow}
				title={c.title}
				accent={c.accent}
				body={c.body}
				image={c.image}
				crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
			/>
			<Suspense>
				<ContactView />
			</Suspense>
			<OfficesSection />
		</>
	);
}
