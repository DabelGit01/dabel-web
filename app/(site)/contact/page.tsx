import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactView } from "@/components/contact/ContactView";
import { OfficesSection } from "@/components/site/OfficesSection";
import { PageHero } from "@/components/site/primitives";

export const metadata: Metadata = {
	title: "Contact",
	description:
		"Contact Dabel Resources Ventures Limited — head office on Egweme Road, Rivers State and our jetty at Gbalajam, Woji. Call 0802 721 8466 or email info@dabel.ng.",
};

export default function ContactPage() {
	return (
		<>
			<PageHero
				eyebrow="Contact"
				title="Let's move"
				accent="your operation."
				body="Request a quote, ask about a service or visit our jetty in Woji — we're ready when you are."
				image="/images/houseboat.jpg"
				crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
			/>
			<Suspense>
				<ContactView />
			</Suspense>
			<OfficesSection />
		</>
	);
}
