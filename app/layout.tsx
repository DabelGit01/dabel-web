import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { introScript } from "@/components/site/Preloader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getContent } from "@/lib/public-data";
import { BASE_URL, SITE } from "@/lib/site";
import "./globals.css";

const display = Inter_Tight({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-display",
	weight: ["400", "500", "600", "700", "800"],
});
const body = Inter({ subsets: ["latin"], display: "swap", variable: "--font-body" });
const code = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-code" });

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: SITE.name,
	url: SITE.url,
	logo: `${SITE.url}/images/dabel-logo.jpg`,
	description: SITE.seoDescription,
	foundingDate: String(SITE.founded),
	knowsAbout: ["Marine logistics", "Vessel management", "Chartering", "Port services", "Cargo transport", "Marine procurement"],
	areaServed: "Niger Delta, Nigeria",
	email: SITE.emails[0],
	telephone: "+234-802-721-8466",
	address: {
		"@type": "PostalAddress",
		streetAddress: "No. 1, Egweme Road, off Odili - Okuru Road",
		addressRegion: "Rivers State",
		addressCountry: "NG",
	},
};

/** Site-wide SEO — admin-editable in Page Content → SEO. Pages override title/description. */
export async function generateMetadata(): Promise<Metadata> {
	const seo = (await getContent()).seo;
	const keywords = seo.keywords
		.split(",")
		.map((k) => k.trim())
		.filter(Boolean);
	return {
		metadataBase: new URL(BASE_URL),
		title: { default: seo.siteTitle, template: `%s | ${seo.titleSuffix}` },
		description: seo.description,
		keywords,
		openGraph: {
			type: "website",
			siteName: SITE.name,
			title: seo.siteTitle,
			description: seo.description,
			url: BASE_URL,
			images: [{ url: seo.shareImage, alt: SITE.name }],
		},
		twitter: { card: "summary_large_image", title: seo.siteTitle, description: seo.description, images: [seo.shareImage] },
	};
}

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
		{ media: "(prefers-color-scheme: dark)", color: "#0a0c1d" },
	],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en"
			className={`${display.variable} ${body.variable} ${code.variable}`}
			suppressHydrationWarning
		>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static pre-paint flag */}
				<script dangerouslySetInnerHTML={{ __html: introScript }} />
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
					<Toaster position="top-right" richColors />
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	);
}
