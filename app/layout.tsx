import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { introScript } from "@/components/site/Preloader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/site";
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

export const metadata: Metadata = {
	metadataBase: new URL(SITE.url),
	title: {
		default: `${SITE.shortName} | ${SITE.seoTitle}`,
		template: `%s | ${SITE.shortName}`,
	},
	description: SITE.seoDescription,
	keywords: [
		"Dabel Resources",
		"marine logistics Nigeria",
		"marine logistics Port Harcourt",
		"vessel management Nigeria",
		"vessel chartering Port Harcourt",
		"inter-ship agency",
		"port services Rivers State",
		"cargo transport Niger Delta",
		"offshore oil and gas logistics",
		"tugboat and barge services",
		"marine vessel supply",
		"oil and gas procurement",
	],
	openGraph: {
		type: "website",
		siteName: SITE.name,
		title: `${SITE.shortName} | ${SITE.seoTitle}`,
		description: SITE.seoDescription,
		url: SITE.url,
		images: [{ url: "/images/tug-barge.jpg", width: 1280, height: 720, alt: SITE.name }],
	},
	twitter: { card: "summary_large_image", images: ["/images/tug-barge.jpg"] },
};

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
