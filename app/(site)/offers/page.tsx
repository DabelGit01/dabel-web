import type { Metadata } from "next";
import { ServicesList } from "@/components/services/ServicesList";
import { OfficesSection } from "@/components/site/OfficesSection";
import { PageHero } from "@/components/site/primitives";
import { getContent } from "@/lib/public-data";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Offers",
	description:
		"Marine logistics in Port Harcourt: vessel management, chartering, inter-ship agency, port services and cargo transport for offshore oil & gas — plus procurement and consultancy.",
};

export default async function OffersPage() {
	const c = (await getContent()).offers;
	return (
		<>
			<PageHero
				eyebrow={c.eyebrow}
				title={c.title}
				accent={c.accent}
				body={c.body}
				image={c.image}
				crumbs={[{ label: "Home", href: "/" }, { label: "Offers" }]}
			/>
			<ServicesList />
			<OfficesSection />
		</>
	);
}
