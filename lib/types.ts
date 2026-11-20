import type { ServiceDivision } from "@/lib/site";

export type GalleryImage = { url: string; title: string };

export type Offer = {
	id: string;
	slug: string;
	name: string;
	category: string;
	status: string;
	description: string;
	subTopic?: string;
	features?: { title: string; description: string }[] | string[] | null;
	imageUrl?: string | null;
	gallery?: GalleryImage[] | null;
	order?: number;
};

export type SiteMeta = {
	welcomeSubtitle: string;
	welcomeTitle: string;
	welcomeBody1: string;
	welcomeBody2: string;
	aboutHistory: string;
	aboutHeader: string;
	aboutBody: string;
	aboutMission: string;
	aboutVision: string;
	founderName: string;
	founderRole: string;
	founderBio: string;
	founderImageUrl?: string | null;
	enquiryText: string;
};

export type Office = { id: string; name: string; address: string; email: string; phone: string };
export type SocialLink = { id: string; platform: string; url: string; published?: boolean };
export type ContactDetail = { id: string; platform: string; label: string; value: string; url: string };
export type Certification = { id: string; title: string; description: string; year: string; imageUrl?: string | null };
export type TeamMember = {
	id: string;
	name: string;
	role: string;
	title: string;
	bio: string | null;
	imageUrl: string | null;
	linkedin: string | null;
};
export type BlogCategory = { id: string; name: string };
export type BlogPost = {
	id: string;
	title: string;
	content: string;
	imageUrl: string | null;
	gallery?: GalleryImage[] | null;
	categoryId: string;
	published: boolean;
	authorName: string;
	readTime: string;
	createdAt: string;
	category?: BlogCategory;
};

export type ServiceView = ServiceDivision & { subTopic?: string };

/** Normalise an admin "offer" into the shape the public service UI renders. */
export function toService(o: Offer): ServiceView {
	const features = Array.isArray(o.features)
		? o.features.map((f) => (typeof f === "string" ? f : f.title)).filter(Boolean)
		: [];
	return {
		slug: o.slug,
		name: o.name,
		category: o.category,
		description: o.description,
		imageUrl: o.imageUrl || "/images/tanker.jpg",
		features,
		subTopic: o.subTopic,
	};
}

export function excerpt(html: string, n = 160) {
	const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
	return text.length > n ? `${text.slice(0, n).trimEnd()}…` : text;
}

export function formatDate(d: string) {
	return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
