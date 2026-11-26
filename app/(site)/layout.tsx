import { ContentProvider } from "@/components/site/ContentProvider";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { Preloader } from "@/components/site/Preloader";
import { getContent } from "@/lib/public-data";

// Content is cached server-side and refreshed on every admin edit (see lib/public-data.ts).
export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const content = await getContent();
	return (
		<ContentProvider value={content}>
			<a href="#main-content" className="skip-link">
				Skip to content
			</a>
			<Preloader />
			<Navbar />
			<main id="main-content">{children}</main>
			<Footer />
		</ContentProvider>
	);
}
