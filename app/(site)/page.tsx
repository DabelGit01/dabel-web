import { HeroSlider } from "@/components/home/HeroSlider";
import { InsightsTeaser } from "@/components/home/InsightsTeaser";
import { ServicesShowcase } from "@/components/home/ServicesShowcase";
import { ValuesSection } from "@/components/home/ValuesSection";
import { WhoWeAre } from "@/components/home/WhoWeAre";
import { CertificationsSection } from "@/components/site/CertificationsSection";
import { OfficesSection } from "@/components/site/OfficesSection";
import { getHeroSlides, getValues } from "@/lib/public-data";

export const revalidate = 60;

export default async function HomePage() {
	const [slides, values] = await Promise.all([getHeroSlides(), getValues()]);
	return (
		<>
			<HeroSlider slides={slides} />
			<WhoWeAre />
			<ServicesShowcase />
			<ValuesSection values={values} />
			<InsightsTeaser />
			<CertificationsSection limit={3} />
			<OfficesSection />
		</>
	);
}
