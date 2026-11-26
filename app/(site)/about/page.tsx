import type { Metadata } from "next";
import { CompanyOverview, FounderSection, LeadershipTeam, SocialHandles } from "@/components/about/AboutSections";
import { LegacySection } from "@/components/home/LegacySection";
import { ValuesSection } from "@/components/home/ValuesSection";
import { CertificationsSection } from "@/components/site/CertificationsSection";
import { OfficesSection } from "@/components/site/OfficesSection";
import { PageHero } from "@/components/site/primitives";
import { getContent, getValues } from "@/lib/public-data";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "About Us",
	description:
		"Founded in 2013 in Rivers State, Dabel Resources Ventures Limited delivers marine logistics, procurement and consultancy to the energy and maritime sectors.",
};

export default async function AboutPage() {
	const [content, values] = await Promise.all([getContent(), getValues()]);
	const c = content.about;
	return (
		<>
			<PageHero
				eyebrow={c.eyebrow}
				title={c.title}
				accent={c.accent}
				body={c.body}
				image={c.image}
				crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
			/>
			<CompanyOverview />
			<ValuesSection values={values} showImages={false} />
			<LegacySection />
			<FounderSection />
			<LeadershipTeam />
			<CertificationsSection id="certifications" />
			<SocialHandles />
			<OfficesSection />
		</>
	);
}
