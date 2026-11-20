/**
 * Dabel brand constants + brochure content.
 * Admin-editable data (site meta, offices, services, team, blog…) comes from the
 * database; these values are the fallbacks and the fixed brand copy.
 */

export const SITE = {
	name: "Dabel Resources Ventures Limited",
	shortName: "Dabel Resources",
	tagline: "Driving Economic and Technological Progress",
	seoTitle: "Marine Logistics, Vessel Management & Chartering in Port Harcourt",
	seoDescription:
		"Dabel Resources Ventures Limited provides marine logistics in Rivers State, Nigeria — vessel management, chartering, inter-ship agency, port services and cargo transport for offshore oil & gas, plus marine procurement and consultancy. Since 2013.",
	url: "https://www.dabel.ng",
	rcNumber: "RC 1142506",
	founded: 2013,
	description:
		"Dabel Resources Ventures Limited is a leading provider of integrated marine logistics, procurement, and environmental solutions, driving economic and technological progress through innovative and client-focused services.",
	phones: ["0802 721 8466", "0806 425 9790"],
	emails: ["info@dabel.ng", "dabelresventsltd@yahoo.com"],
	partners: [
		"Shell Petroleum Development Company of Nigeria (SPDC)",
		"Unilever Nigeria PLC",
	],
} as const;

export const NAV_LINKS = [
	{ label: "Home", href: "/" },
	{ label: "About", href: "/about" },
	{ label: "Services", href: "/services" },
	{ label: "Insights", href: "/insights" },
	{ label: "Contact", href: "/contact" },
] as const;

export const OFFICES_FALLBACK = [
	{
		id: "hq",
		name: "Head Office",
		address: "No. 1, Egweme Road, off Odili - Okuru Road, Rivers State.",
		email: "info@dabel.ng",
		phone: "0802 721 8466",
	},
	{
		id: "jetty",
		name: "Jetty / Operational Base",
		address: "Dabel Resources Jetty / Operational Base, Gbalajam, Woji, Rivers State.",
		email: "dabelresventsltd@yahoo.com",
		phone: "0806 425 9790",
	},
];

export type HeroSlide = {
	id: string;
	eyebrow: string;
	lines: [string, string, string];
	accentLine: 0 | 1 | 2;
	body: string;
	image: string;
	alt: string;
	cta: { label: string; href: string };
	label: string;
};

export const HERO_SLIDES: HeroSlide[] = [
	{
		id: "marine",
		label: "Marine Logistics",
		eyebrow: "Marine Logistics · Since 2013",
		lines: ["Driving economic", "& technological", "progress."],
		accentLine: 2,
		body: "Integrated marine logistics, procurement and environmental solutions for the energy and maritime sectors.",
		image: "/images/tug-barge.jpg",
		alt: "Dabel tugboat MV Dabel Angel II towing a barge past the jetty",
		cta: { label: "Explore services", href: "/services" },
	},
	{
		id: "vessels",
		label: "Vessel Management",
		eyebrow: "Vessel Management & Chartering",
		lines: ["Vessels managed.", "Crews ready.", "On schedule."],
		accentLine: 2,
		body: "Vessel management, chartering, inter-ship agency and port services for offshore oil & gas operations.",
		image: "/images/port-traffic.jpg",
		alt: "Crew boats and offshore support vessels moving through a busy port",
		cta: { label: "Marine services", href: "/services" },
	},
	{
		id: "procurement",
		label: "Procurement & Supply",
		eyebrow: "Procurement & Marine Supply",
		lines: ["Cargo moved.", "Supply delivered.", "Operations running."],
		accentLine: 2,
		body: "Cargo transport and marine vessel, fuel, water and labour supply — plus valves, flanges and coated pipes, delivered to site.",
		image: "/images/crane-container.jpg",
		alt: "Crane lifting a container onto a barge at the Dabel jetty",
		cta: { label: "Procurement services", href: "/services" },
	},
];

export const TICKER = [
	"Marine logistics",
	"Vessel management",
	"Chartering",
	"Inter-ship agency",
	"Port services",
	"Cargo transport",
	"Offshore oil & gas support",
	"Marine vessel supply",
	"Fuel & water supply",
	"Valves, flanges & coated pipes",
	"Marine consultancy",
];

export const VALUES = [
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

export type ServiceDivision = {
	slug: string;
	name: string;
	category: string;
	description: string;
	imageUrl: string;
	features: string[];
};

/** Brochure p.9 — used when no services have been published from the admin yet. */
export const SERVICES_FALLBACK: ServiceDivision[] = [
	{
		slug: "marine-logistics",
		name: "Marine Logistics",
		category: "Marine",
		description:
			"End-to-end marine logistics for offshore oil & gas — from vessel management and chartering to port services and cargo transport.",
		imageUrl: "/images/tanker.jpg",
		features: [
			"Offshore Oil & Gas",
			"Vessel management",
			"Inter-ship agency",
			"Port services",
			"Cargo transport",
			"Chartering",
		],
	},
	{
		slug: "consultancy",
		name: "Consultancy",
		category: "Environmental",
		description:
			"Specialist consultancy and skilled personnel for marine and oil & gas operations — including environmental and industrial services.",
		imageUrl: "/images/consultancy-meeting.jpg",
		features: [
			"Oil spill and hazardous material emergency response",
			"Hazardous and biological waste remediation and cleanup",
			"Asbestos, lead, and mold survey and abatement",
			"Industrial cleaning and demolition services",
			"Pollution control product manufacturing and sales",
			"HR outsourcing — engineers, waste management staff and documentation personnel",
		],
	},
	{
		slug: "procurement",
		name: "Procurement Services for Oil & Gas",
		category: "Procurement",
		description:
			"Supply chain services that keep oil and gas operations running on schedule.",
		imageUrl: "/images/refinery.jpg",
		features: [
			"Marine vessel supply",
			"Water supply",
			"Labor supply",
			"Fuel supply",
			"Valves, flanges, and coated pipes",
		],
	},
];

export const ABOUT_FALLBACK = {
	welcomeSubtitle: "Who We Are",
	welcomeTitle: "Integrated marine, procurement & environmental solutions",
	welcomeBody1: SITE.description,
	welcomeBody2:
		"We empower businesses and communities by providing reliable, efficient, and sustainable solutions that meet the evolving demands of the global market.",
	aboutHistory:
		"Founded in 2013 and registered with the Corporate Affairs Commission (CAC) in Nigeria (RC 1142506), Dabel Resources Ventures Limited has consistently demonstrated a strong commitment to excellence and client satisfaction. Our journey began with a vision to provide reliable and innovative solutions to the challenges faced by the energy and maritime sectors. Since our inception, we have built strong partnerships with industry leaders such as Shell Petroleum Development Company of Nigeria (SPDC) and Unilever Nigeria PLC, solidifying our position as a trusted and respected player in the market.",
	aboutVision:
		"To ensure safety and peace of mind through our experience and professionalism in an aesthetically driven environment.",
	aboutMission:
		"To execute services promptly and optimally, aligning with industry standards and client requirements.",
	enquiryText:
		"Talk to our team about vessels, environmental response or supply for your next operation — we respond promptly.",
};

export function yearsInOperation() {
	return new Date().getFullYear() - SITE.founded;
}
