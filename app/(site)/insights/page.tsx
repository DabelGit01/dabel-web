import { InsightsBrowser } from "@/components/insights/InsightsBrowser";
import { PageHero } from "@/components/site/primitives";
import { getContent } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export function generateMetadata() {
	return pageMetadata("insights");
}

export default async function InsightsPage() {
	const content = await getContent();
	const c = content.insights;
	return (
		<>
			<PageHero
				eyebrow={c.eyebrow}
				title={c.title}
				accent={c.accent}
				body={c.body}
				image={c.image}
				crumbs={[{ label: content.nav.home, href: "/" }, { label: content.nav.insights }]}
			/>
			<InsightsBrowser />
		</>
	);
}
