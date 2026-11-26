import { CompanyOverview, FounderSection, LeadershipTeam, SocialHandles } from "@/components/about/AboutSections";
import { LegacySection } from "@/components/home/LegacySection";
import { ValuesSection } from "@/components/home/ValuesSection";
import { CertificationsSection } from "@/components/site/CertificationsSection";
import { OfficesSection } from "@/components/site/OfficesSection";
import { PageHero } from "@/components/site/primitives";
import { getContent, getValues } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export function generateMetadata() {
	return pageMetadata("about");
}

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
				crumbs={[{ label: content.nav.home, href: "/" }, { label: content.nav.about }]}
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
