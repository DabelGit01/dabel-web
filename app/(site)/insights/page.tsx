import type { Metadata } from "next";
import { InsightsBrowser } from "@/components/insights/InsightsBrowser";
import { PageHero } from "@/components/site/primitives";

export const metadata: Metadata = {
	title: "Insights",
	description: "News, operations updates and industry insights from Dabel Resources Ventures Limited.",
};

export default function InsightsPage() {
	return (
		<>
			<PageHero
				eyebrow="Insights"
				title="News from"
				accent="the waterfront."
				body="Operations updates, safety notes and industry perspectives from the Dabel team."
				image="/images/cranes-lift.jpg"
				crumbs={[{ label: "Home", href: "/" }, { label: "Insights" }]}
			/>
			<InsightsBrowser />
		</>
	);
}
