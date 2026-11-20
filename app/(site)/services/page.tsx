import type { Metadata } from "next";
import { ServicesList } from "@/components/services/ServicesList";
import { OfficesSection } from "@/components/site/OfficesSection";
import { PageHero } from "@/components/site/primitives";

export const metadata: Metadata = {
	title: "Services",
	description:
		"Marine logistics in Port Harcourt: vessel management, chartering, inter-ship agency, port services and cargo transport for offshore oil & gas — plus marine procurement and consultancy.",
};

export default function ServicesPage() {
	return (
		<>
			<PageHero
				eyebrow="What we do"
				title="Marine logistics"
				accent="& integrated services."
				body="Vessel management, chartering, port services and cargo transport — backed by procurement and consultancy for the oil & gas sector."
				image="/images/port-traffic.jpg"
				crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
			/>
			<ServicesList />
			<OfficesSection />
		</>
	);
}
