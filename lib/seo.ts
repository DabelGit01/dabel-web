import "server-only";
import type { Metadata } from "next";
import { getContent } from "@/lib/public-data";
import { BASE_URL, SITE } from "@/lib/site";

type Page = "about" | "offers" | "insights" | "contact";

/** Per-page metadata from Admin → Page Content → SEO. */
export async function pageMetadata(page: Page): Promise<Metadata> {
	const seo = (await getContent()).seo;
	const title = seo[`${page}Title`];
	const description = seo[`${page}Description`];
	const fullTitle = `${title} | ${seo.titleSuffix}`;
	return {
		title,
		description,
		openGraph: {
			type: "website",
			siteName: SITE.name,
			title: fullTitle,
			description,
			url: `${BASE_URL}/${page}`,
			images: [{ url: seo.shareImage, alt: SITE.name }],
		},
		twitter: { card: "summary_large_image", title: fullTitle, description, images: [seo.shareImage] },
	};
}
