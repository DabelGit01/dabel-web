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
	{ label: "Offers", href: "/offers" },
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

// Hero slides and values are managed in the admin (Page Content); defaults live in lib/content.ts.

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

