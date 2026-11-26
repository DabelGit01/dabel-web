import type { Metadata } from "next";
import { InsightsBrowser } from "@/components/insights/InsightsBrowser";
import { PageHero } from "@/components/site/primitives";
import { getContent } from "@/lib/public-data";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Insights",
	description: "News, operations updates and industry insights from Dabel Resources Ventures Limited.",
};

export default async function InsightsPage() {
	const c = (await getContent()).insights;
	return (
		<>
			<PageHero
				eyebrow={c.eyebrow}
				title={c.title}
				accent={c.accent}
				body={c.body}
				image={c.image}
				crumbs={[{ label: "Home", href: "/" }, { label: "Insights" }]}
			/>
			<InsightsBrowser />
		</>
	);
}
