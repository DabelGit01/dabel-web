import { z } from "zod";

export const heroSlideSchema = z.object({
	label: z.string().trim().min(1, "Label is required").max(60),
	eyebrow: z.string().trim().max(80).default(""),
	line1: z.string().trim().min(1, "Headline line 1 is required").max(60),
	line2: z.string().trim().max(60).default(""),
	line3: z.string().trim().max(60).default(""),
	accentLine: z.coerce.number().int().min(1).max(3).default(3),
	body: z.string().trim().max(400).default(""),
	imageUrl: z.string().trim().min(1, "Choose a background photo"),
	ctaLabel: z.string().trim().max(40).default("Explore offers"),
	ctaHref: z.string().trim().max(200).default("/offers"),
	order: z.coerce.number().int().optional(),
	published: z.boolean().default(true),
});

export const valueSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(60),
	body: z.string().trim().min(1, "Description is required").max(600),
	images: z.array(z.string().trim().min(1)).max(3, "Up to 3 photos").default([]),
	order: z.coerce.number().int().optional(),
	published: z.boolean().default(true),
});
