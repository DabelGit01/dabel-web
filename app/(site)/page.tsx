import { HeroSlider } from "@/components/home/HeroSlider";
import { InsightsTeaser } from "@/components/home/InsightsTeaser";
import { LegacySection } from "@/components/home/LegacySection";
import { ServicesShowcase } from "@/components/home/ServicesShowcase";
import { ValuesSection } from "@/components/home/ValuesSection";
import { WhoWeAre } from "@/components/home/WhoWeAre";
import { CertificationsSection } from "@/components/site/CertificationsSection";
import { OfficesSection } from "@/components/site/OfficesSection";

export default function HomePage() {
	return (
		<>
			<HeroSlider />
			<WhoWeAre />
			<ServicesShowcase />
			<ValuesSection />
			<LegacySection />
			<InsightsTeaser />
			<CertificationsSection limit={3} />
			<OfficesSection />
		</>
	);
}
