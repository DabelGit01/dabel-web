import bcrypt from "bcryptjs";
import { HERO_DEFAULTS, VALUE_DEFAULTS } from "../lib/content";
import { prisma } from "../lib/prisma";

/**
 * Seeds Dabel defaults from the company brochure. Every step is skipped when
 * its table already has data, so it is safe to re-run.
 *
 * Required env: ADMIN_PASSWORD (initial super-admin password)
 * Optional env: ADMIN_EMAIL (defaults to admin@dabel.ng)
 */
async function main() {
	console.log("Seeding Dabel database…");

	if ((await prisma.siteMeta.count()) === 0) {
		await prisma.siteMeta.create({
			data: {
				welcomeSubtitle: "Who We Are",
				welcomeTitle: "Driving Economic and Technological Progress",
				welcomeBody1:
					"Dabel Resources Ventures Limited is a leading provider of integrated marine logistics, procurement, and environmental solutions, driving economic and technological progress through innovative and client-focused services.",
				welcomeBody2:
					"We empower businesses and communities by providing reliable, efficient, and sustainable solutions that meet the evolving demands of the global market.",
				aboutHistory:
					"Founded in 2013 and registered with the Corporate Affairs Commission (CAC) in Nigeria (RC 1142506), Dabel Resources Ventures Limited has consistently demonstrated a strong commitment to excellence and client satisfaction. Our journey began with a vision to provide reliable and innovative solutions to the challenges faced by the energy and maritime sectors. Since our inception, we have built strong partnerships with industry leaders such as Shell Petroleum Development Company of Nigeria (SPDC) and Unilever Nigeria PLC, solidifying our position as a trusted and respected player in the market.",
			},
		});
		console.log("  ✓ site meta");
	}

	if ((await prisma.office.count()) === 0) {
		await prisma.office.createMany({
			data: [
				{
					name: "Head Office",
					address: "No. 1, Egweme Road, off Odili - Okuru Road, Rivers State.",
					email: "info@dabel.ng",
					phone: "0802 721 8466",
					order: 0,
				},
				{
					name: "Jetty / Operational Base",
					address: "Dabel Resources Jetty / Operational Base, Gbalajam, Woji, Rivers State.",
					email: "dabelresventsltd@yahoo.com",
					phone: "0806 425 9790",
					order: 1,
				},
			],
		});
		console.log("  ✓ offices");
	}

	if ((await prisma.contactDetail.count()) === 0) {
		await prisma.contactDetail.createMany({
			data: [
				{ platform: "phone", label: "Call us", value: "0802 721 8466", url: "tel:+2348027218466", order: 0 },
				{ platform: "phone", label: "Operations line", value: "0806 425 9790", url: "tel:+2348064259790", order: 1 },
				{ platform: "mail", label: "Email", value: "info@dabel.ng", url: "mailto:info@dabel.ng", order: 2 },
				{ platform: "mail", label: "Alternate email", value: "dabelresventsltd@yahoo.com", url: "mailto:dabelresventsltd@yahoo.com", order: 3 },
			],
		});
		console.log("  ✓ contact details");
	}

	if ((await prisma.offer.count()) === 0) {
		const services = [
			{
				slug: "marine-logistics",
				name: "Marine Logistics",
				category: "Marine",
				subTopic: "Vessels, agency, port services and cargo — handled end to end.",
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
				subTopic: "Specialist consultancy and skilled personnel for marine and oil & gas operations.",
				description:
					"Specialist consultancy and HR outsourcing for marine and oil & gas operations — including environmental and industrial services.",
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
				subTopic: "The supply chain that keeps operations running.",
				description: "Supply chain services that keep oil and gas operations running on schedule.",
				imageUrl: "/images/refinery.jpg",
				features: ["Marine vessel supply", "Water supply", "Labor supply", "Fuel supply", "Valves, flanges, and coated pipes"],
			},
		];
		for (const [order, s] of services.entries()) {
			await prisma.offer.create({
				data: {
					...s,
					status: "Available",
					order,
					tags: [s.category],
					galleryUrls: [],
					features: s.features.map((title) => ({ title, description: "" })),
				},
			});
		}
		console.log("  ✓ services");
	}

	if ((await prisma.blogCategory.count()) === 0) {
		await prisma.blogCategory.createMany({
			data: [{ name: "Company News" }, { name: "Operations" }, { name: "Safety & Environment" }],
		});
		console.log("  ✓ blog categories");
	}

	if ((await prisma.heroSlide.count()) === 0) {
		for (const [order, s] of HERO_DEFAULTS.entries()) {
			await prisma.heroSlide.create({ data: { ...s, order } });
		}
		console.log("  ✓ hero slides");
	}

	if ((await prisma.coreValue.count()) === 0) {
		for (const [order, v] of VALUE_DEFAULTS.entries()) {
			await prisma.coreValue.create({ data: { ...v, order } });
		}
		console.log("  ✓ values");
	}

	// added after first launch — upsert so existing databases get it too
	await prisma.permission.upsert({
		where: { path: "/admin/content" },
		update: {},
		create: { name: "Page Content", path: "/admin/content" },
	});

	if ((await prisma.permission.count()) === 0) {
		await prisma.permission.createMany({
			data: [
				{ name: "Messages", path: "/admin/messages" },
				{ name: "Services", path: "/admin/offers" },
				{ name: "Blog & Newsletter", path: "/admin/blog" },
				{ name: "Devices", path: "/admin/devices" },
				{ name: "Site Meta", path: "/admin/site-meta" },
				{ name: "Admin Management", path: "/admin/admins" },
			],
		});
		console.log("  ✓ permissions");
	}

	if ((await prisma.admin.count()) === 0) {
		const password = process.env.ADMIN_PASSWORD;
		if (!password || password.length < 10) {
			throw new Error("Set ADMIN_PASSWORD (10+ characters) before seeding the super admin.");
		}
		await prisma.admin.create({
			data: {
				fullName: "Super Admin",
				email: process.env.ADMIN_EMAIL || "admin@dabel.ng",
				password: await bcrypt.hash(password, 10),
				permissions: ["*"],
			},
		});
		console.log("  ✓ super admin");
	}

	console.log("Done.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
