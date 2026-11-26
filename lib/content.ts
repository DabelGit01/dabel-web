/**
 * Editable page content — single source of truth for:
 *  - the admin "Page Content" editor (field labels, types, grouping)
 *  - the public site (defaults when the admin hasn't changed a field)
 *
 * Stored in the SiteContent table as one row per section: { key, value: { field: string } }.
 * Long-form copy (who-we-are write-up, about body, mission, vision, history, founder)
 * lives in Site Meta → Landing and is edited there.
 */

export type FieldType = "text" | "textarea" | "image" | "url";
export type FieldDef = { name: string; label: string; type?: FieldType; help?: string };
export type SectionDef = { key: SectionKey; page: string; title: string; description?: string; fields: FieldDef[] };

const heroFields = (page: string): FieldDef[] => [
	{ name: "eyebrow", label: `${page} header — small label` },
	{ name: "title", label: `${page} header — headline (white)` },
	{ name: "accent", label: `${page} header — headline line 2 (cyan)` },
	{ name: "body", label: `${page} header — intro text`, type: "textarea" },
	{ name: "image", label: `${page} header — background photo`, type: "image" },
];

export const CONTENT_DEFAULTS = {
	global: {
		tagline: "Driving Economic and Technological Progress",
		footerDescription:
			"Dabel Resources Ventures Limited is a leading provider of integrated marine logistics, procurement, and environmental solutions, driving economic and technological progress through innovative and client-focused services.",
		footerCtaTitle: "Have an operation coming up?",
		footerCtaAccent: "Let's move it.",
		footerCtaButton: "Request a quote",
		newsletterTitle: "Stay updated",
		newsletterText: "Operations news and industry updates from Dabel, straight to your inbox.",
		navCtaLabel: "Get a quote",
		copyright: "Dabel Resources Ventures Limited. RC 1142506.",
	},
	homeAbout: {
		title: "About Us",
		subtitle: "Who We Are",
		stat1Value: "Est. 2013",
		stat1Label: "Founded in Rivers State",
		stat2Value: "RC 1142506",
		stat2Label: "Registered with CAC",
		stat3Value: "SPDC · Unilever",
		stat3Label: "Trusted partners",
		buttonLabel: "More about us",
	},
	homeOffers: {
		title: "Offers",
		subtitle: "What We Do",
		intro: "Marine logistics is our core — vessels, port services and cargo — supported by consultancy and procurement for the oil & gas sector.",
		buttonLabel: "View all offers",
	},
	homeValues: { title: "Our Values", subtitle: "Guiding Principles" },
	homeInsights: {
		title: "Insights",
		subtitle: "News & Updates",
		intro: "Operations updates, safety notes and industry news from the Dabel team.",
		buttonLabel: "All insights",
	},
	office: {
		title: "Our Office",
		cardText: "Driving Economic and Technological Progress",
	},
	certifications: {
		title: "Certifications",
		subtitle: "Accreditations",
		intro: "Registered, certified and compliant — the credentials behind every engagement.",
	},
	about: {
		eyebrow: "About Dabel · Since 2013",
		title: "Building a legacy",
		accent: "on the water.",
		body: "A decade of reliable, efficient and sustainable operations for the energy and maritime sectors of the Niger Delta.",
		image: "/images/tanker.jpg",
		overviewTitle: "About Us",
		overviewSubtitle: "Who We Are",
		historyTitle: "History",
		historySubtitle: "Building a Legacy",
		visionTitle: "Our Vision",
		missionTitle: "Our Mission",
		founderTitle: "Leadership",
		founderSubtitle: "Our Founder",
		teamTitle: "Our Team",
		teamSubtitle: "The People Behind Dabel",
		socialsTitle: "Connect",
		socialsSubtitle: "Follow Dabel",
	},
	offers: {
		eyebrow: "What we do",
		title: "Marine logistics",
		accent: "& integrated offers.",
		body: "Vessel management, chartering, port services and cargo transport — backed by procurement and consultancy for the oil & gas sector.",
		image: "/images/port-traffic.jpg",
		enquiryTitle: "For more enquiries",
		enquiryButton: "Request this offer",
	},
	insights: {
		eyebrow: "Insights",
		title: "News from",
		accent: "the waterfront.",
		body: "Operations updates, safety notes and industry perspectives from the Dabel team.",
		image: "/images/cranes-lift.jpg",
		emptyTitle: "No articles yet",
		emptyText: "Check back soon for news from the Dabel team.",
	},
	contact: {
		eyebrow: "Contact",
		title: "Let's move",
		accent: "your operation.",
		body: "Request a quote, ask about an offer or visit our jetty in Woji — we're ready when you are.",
		image: "/images/houseboat.jpg",
		sectionTitle: "Let's talk",
		sectionSubtitle: "We respond promptly",
		sectionIntro: "Vessels, environmental response, supply or personnel — tell us what you need and our team will come back to you.",
		formTitle: "Send us a message",
		formNote: "Fields marked optional can be left blank.",
		successMessage: "Thank you — your message is in. Our team will get back to you shortly.",
		mapQuery: "Gbalajam, Woji, Port Harcourt, Rivers State",
	},
} as const;

export type SectionKey = keyof typeof CONTENT_DEFAULTS;
export type Content = { [K in SectionKey]: { [F in keyof (typeof CONTENT_DEFAULTS)[K]]: string } };

/** Admin editor layout — every field in CONTENT_DEFAULTS appears here exactly once. */
export const CONTENT_SECTIONS: SectionDef[] = [
	{
		key: "global",
		page: "Site-wide",
		title: "Header, footer & tagline",
		fields: [
			{ name: "tagline", label: "Company tagline" },
			{ name: "navCtaLabel", label: "Header button label" },
			{ name: "footerDescription", label: "Footer company description", type: "textarea" },
			{ name: "footerCtaTitle", label: "Footer banner headline" },
			{ name: "footerCtaAccent", label: "Footer banner headline (cyan part)" },
			{ name: "footerCtaButton", label: "Footer banner button label" },
			{ name: "newsletterTitle", label: "Newsletter heading" },
			{ name: "newsletterText", label: "Newsletter text", type: "textarea" },
			{ name: "copyright", label: "Copyright line", help: "The year is added automatically." },
		],
	},
	{
		key: "homeAbout",
		page: "Home",
		title: "About / Who We Are section",
		description: "The write-up paragraphs themselves are edited in Site Meta → Landing Meta (welcome title & body).",
		fields: [
			{ name: "title", label: "Heading" },
			{ name: "subtitle", label: "Sub-heading" },
			{ name: "stat1Value", label: "Fact 1 — value" },
			{ name: "stat1Label", label: "Fact 1 — label" },
			{ name: "stat2Value", label: "Fact 2 — value" },
			{ name: "stat2Label", label: "Fact 2 — label" },
			{ name: "stat3Value", label: "Fact 3 — value" },
			{ name: "stat3Label", label: "Fact 3 — label" },
			{ name: "buttonLabel", label: "Button label" },
		],
	},
	{
		key: "homeOffers",
		page: "Home",
		title: "Offers section",
		description: "Shows the first 3 published offers (order them in Offers).",
		fields: [
			{ name: "title", label: "Heading" },
			{ name: "subtitle", label: "Sub-heading" },
			{ name: "intro", label: "Intro text", type: "textarea" },
			{ name: "buttonLabel", label: "Button label" },
		],
	},
	{
		key: "homeValues",
		page: "Home",
		title: "Values section",
		description: "The values themselves are edited in the Values tab.",
		fields: [
			{ name: "title", label: "Heading" },
			{ name: "subtitle", label: "Sub-heading" },
		],
	},
	{
		key: "homeInsights",
		page: "Home",
		title: "Insights teaser",
		fields: [
			{ name: "title", label: "Heading" },
			{ name: "subtitle", label: "Sub-heading" },
			{ name: "intro", label: "Intro text", type: "textarea" },
			{ name: "buttonLabel", label: "Button label" },
		],
	},
	{
		key: "office",
		page: "Home & other pages",
		title: "Our Office section",
		description: "Addresses, phones and emails are edited in Site Meta → Where We Operate.",
		fields: [
			{ name: "title", label: "Heading" },
			{ name: "cardText", label: "Text under the logo card" },
		],
	},
	{
		key: "certifications",
		page: "Home & About",
		title: "Certifications section",
		description: "Certificates themselves are edited in Site Meta → Certifications.",
		fields: [
			{ name: "title", label: "Heading" },
			{ name: "subtitle", label: "Sub-heading" },
			{ name: "intro", label: "Intro text", type: "textarea" },
		],
	},
	{
		key: "about",
		page: "About page",
		title: "About page",
		description: "Body text, mission, vision, history and founder are edited in Site Meta → Landing Meta.",
		fields: [
			...heroFields("Page"),
			{ name: "overviewTitle", label: "Overview heading" },
			{ name: "overviewSubtitle", label: "Overview sub-heading" },
			{ name: "historyTitle", label: "History heading" },
			{ name: "historySubtitle", label: "History sub-heading" },
			{ name: "visionTitle", label: "Vision heading" },
			{ name: "missionTitle", label: "Mission heading" },
			{ name: "founderTitle", label: "Founder heading" },
			{ name: "founderSubtitle", label: "Founder sub-heading" },
			{ name: "teamTitle", label: "Team heading" },
			{ name: "teamSubtitle", label: "Team sub-heading" },
			{ name: "socialsTitle", label: "Social links heading" },
			{ name: "socialsSubtitle", label: "Social links sub-heading" },
		],
	},
	{
		key: "offers",
		page: "Offers page",
		title: "Offers page",
		description: "The offers themselves are edited in Offers.",
		fields: [
			...heroFields("Page"),
			{ name: "enquiryTitle", label: "Offer detail — enquiry box heading" },
			{ name: "enquiryButton", label: "Offer detail — enquiry button label" },
		],
	},
	{
		key: "insights",
		page: "Insights page",
		title: "Insights page",
		fields: [
			...heroFields("Page"),
			{ name: "emptyTitle", label: "No-articles heading" },
			{ name: "emptyText", label: "No-articles text", type: "textarea" },
		],
	},
	{
		key: "contact",
		page: "Contact page",
		title: "Contact page",
		description: "Phone numbers & emails are edited in Site Meta → Contact Details.",
		fields: [
			...heroFields("Page"),
			{ name: "sectionTitle", label: "Section heading" },
			{ name: "sectionSubtitle", label: "Section sub-heading" },
			{ name: "sectionIntro", label: "Section intro", type: "textarea" },
			{ name: "formTitle", label: "Form heading" },
			{ name: "formNote", label: "Form note" },
			{ name: "successMessage", label: "Message after sending", type: "textarea" },
			{ name: "mapQuery", label: "Map location (search text)", help: "Anything you'd type into Google Maps." },
		],
	},
];

/** Merge stored rows over defaults; unknown keys/fields are ignored, blanks fall back to defaults. */
export function mergeContent(rows: { key: string; value: unknown }[]): Content {
	const out = structuredClone(CONTENT_DEFAULTS) as unknown as Record<string, Record<string, string>>;
	for (const row of rows) {
		const section = out[row.key];
		if (!section || typeof row.value !== "object" || row.value === null) continue;
		for (const [field, val] of Object.entries(row.value as Record<string, unknown>)) {
			if (field in section && typeof val === "string" && val.trim() !== "") section[field] = val;
		}
	}
	return out as unknown as Content;
}

export function isSectionKey(k: string): k is SectionKey {
	return k in CONTENT_DEFAULTS;
}

/** Defaults for hero slides + values (used by the seed and as a fallback when the DB is unreachable). */
export const HERO_DEFAULTS = [
	{
		label: "Marine Logistics",
		eyebrow: "Marine Logistics · Since 2013",
		line1: "Marine logistics",
		line2: "you can rely on,",
		line3: "every tide.",
		accentLine: 3,
		body: "Vessel management, chartering, inter-ship agency, port services and cargo transport for offshore oil & gas operations.",
		imageUrl: "/images/tug-barge.jpg",
		ctaLabel: "Explore offers",
		ctaHref: "/offers",
	},
	{
		label: "Consultancy",
		eyebrow: "Consultancy",
		line1: "Expert consultancy",
		line2: "for safer, cleaner",
		line3: "operations.",
		accentLine: 3,
		body: "Environmental and industrial consultancy, plus skilled personnel — engineers, waste management staff and documentation teams — for the oil & gas sector.",
		imageUrl: "/images/consultancy-meeting.jpg",
		ctaLabel: "Our consultancy",
		ctaHref: "/offers/consultancy",
	},
	{
		label: "Procurement",
		eyebrow: "Procurement for Oil & Gas",
		line1: "The supply chain",
		line2: "that keeps you",
		line3: "operating.",
		accentLine: 3,
		body: "Marine vessel, water, labour and fuel supply — plus valves, flanges and coated pipes, delivered to site.",
		imageUrl: "/images/crane-container.jpg",
		ctaLabel: "Procurement offers",
		ctaHref: "/offers/procurement",
	},
];

export const VALUE_DEFAULTS = [
	{
		name: "Speed",
		body: "We prioritize agility, efficiency, and proactive problem-solving to ensure timely and responsive service delivery.",
		images: ["/images/crane-container.jpg", "/images/tanker.jpg", "/images/cranes-lift.jpg"],
	},
	{
		name: "Efficiency",
		body: "We optimize resources, minimize waste, and continuously improve our processes to deliver maximum value with minimal effort.",
		images: ["/images/tug-barge.jpg", "/images/deck-equipment.jpg", "/images/barge-tanks.jpg"],
	},
	{
		name: "Dependability",
		body: "We strive for consistent quality, take responsibility for our commitments, and maintain open communication to build lasting trust with our clients.",
		images: ["/images/crew-briefing.jpg", "/images/houseboat.jpg", "/images/tug-angel-vi.jpg"],
	},
	{
		name: "Commitment",
		body: "We are dedicated to client satisfaction, employee growth, and ethical conduct in all our business endeavors.",
		images: ["/images/port-traffic.jpg", "/images/tug-barge.jpg", "/images/crew-briefing.jpg"],
	},
	{
		name: "Quality Management",
		body: "We pursue excellence in all aspects of our work, continuously seek feedback, and prioritize client satisfaction to deliver exceptional service.",
		images: ["/images/boat-cabin.jpg", "/images/houseboat.jpg", "/images/deck-equipment.jpg"],
	},
];

export type HeroSlideData = (typeof HERO_DEFAULTS)[number] & { id: string };
export type CoreValueData = { id: string; name: string; body: string; images: string[] };
