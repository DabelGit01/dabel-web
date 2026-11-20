import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DabelMark } from "@/components/brand/DabelLogo";

export default function NotFound() {
	return (
		<main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-navy-deep px-6 text-center text-white">
			<p
				aria-hidden="true"
				className="pointer-events-none absolute select-none font-heading text-[38vw] font-bold leading-none tracking-tighter text-white/[0.04]"
			>
				404
			</p>
			<DabelMark tone="onDark" className="relative h-20 w-24" />
			<h1 className="relative mt-8 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Off course.</h1>
			<p className="relative mt-4 max-w-md text-lg text-white/70">
				The page you're looking for has moved or doesn't exist. Let's get you back to port.
			</p>
			<Link
				href="/"
				className="relative mt-10 inline-flex min-h-13 items-center gap-2.5 rounded-full bg-brand px-7 font-semibold text-brand-contrast transition hover:bg-[#4cc8f4]"
			>
				<ArrowLeft className="h-4 w-4" /> Back to home
			</Link>
		</main>
	);
}
