import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { Preloader } from "@/components/site/Preloader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<a href="#main-content" className="skip-link">
				Skip to content
			</a>
			<Preloader />
			<Navbar />
			<main id="main-content">{children}</main>
			<Footer />
		</>
	);
}
