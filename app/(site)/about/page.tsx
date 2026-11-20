import type { Metadata } from "next";
import { CompanyOverview, FounderSection, LeadershipTeam, SocialHandles } from "@/components/about/AboutSections";
import { LegacySection } from "@/components/home/LegacySection";
import { ValuesSection } from "@/components/home/ValuesSection";
import { CertificationsSection } from "@/components/site/CertificationsSection";
import { OfficesSection } from "@/components/site/OfficesSection";
import { PageHero } from "@/components/site/primitives";

export const metadata: Metadata = {
	title: "About Us",
	description:
		"Founded in 2013 in Rivers State, Dabel Resources Ventures Limited delivers marine logistics, procurement and environmental solutions to the energy and maritime sectors.",
};

export default function AboutPage() {
	return (
		<>
			<PageHero
				eyebrow="About Dabel · Since 2013"
				title="Building a legacy"
				accent="on the water."
				body="A decade of reliable, efficient and sustainable operations for the energy and maritime sectors of the Niger Delta."
				image="/images/tanker.jpg"
				crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
			/>
			<CompanyOverview />
			<ValuesSection />
			<LegacySection />
			<FounderSection />
			<LeadershipTeam />
			<CertificationsSection id="certifications" />
			<SocialHandles />
			<OfficesSection />
		</>
	);
}
