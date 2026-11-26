import { Suspense } from "react";
import { ContactView } from "@/components/contact/ContactView";
import { OfficesSection } from "@/components/site/OfficesSection";
import { PageHero } from "@/components/site/primitives";
import { getContent } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export function generateMetadata() {
	return pageMetadata("contact");
}

export default async function ContactPage() {
	const content = await getContent();
	const c = content.contact;
	return (
		<>
			<PageHero
				eyebrow={c.eyebrow}
				title={c.title}
				accent={c.accent}
				body={c.body}
				image={c.image}
				crumbs={[{ label: content.nav.home, href: "/" }, { label: content.nav.contact }]}
			/>
			<Suspense>
				<ContactView />
			</Suspense>
			<OfficesSection />
		</>
	);
}
