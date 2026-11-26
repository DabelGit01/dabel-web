"use client";

import {
	ArrowRight,
	ArrowUp,
	Check,
	Facebook,
	Globe,
	Instagram,
	Linkedin,
	Loader2,
	type LucideIcon,
	Mail,
	Phone,
	Twitter,
	Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DabelLogo } from "@/components/brand/DabelLogo";
import { useContent, useNavLinks } from "@/components/site/ContentProvider";
import { useApi } from "@/hooks/use-api";
import { SERVICES_FALLBACK } from "@/lib/site";
import type { ContactDetail, Offer, SocialLink } from "@/lib/types";

function socialIcon(platform: string): LucideIcon {
	const p = platform.toLowerCase();
	if (p.includes("linkedin")) return Linkedin;
	if (p.includes("facebook")) return Facebook;
	if (p.includes("twitter") || p === "x") return Twitter;
	if (p.includes("instagram")) return Instagram;
	if (p.includes("youtube")) return Youtube;
	if (p.includes("phone") || p.includes("whatsapp")) return Phone;
	if (p.includes("mail")) return Mail;
	return Globe;
}

function Newsletter() {
	const [email, setEmail] = useState("");
	const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
	const [msg, setMsg] = useState("");

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setState("busy");
		try {
			const res = await fetch("/api/newsletter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			if (!res.ok) {
				const d = await res.json().catch(() => ({}));
				throw new Error(d.error || "Could not subscribe");
			}
			setState("ok");
			setEmail("");
		} catch (err) {
			setState("err");
			setMsg(err instanceof Error ? err.message : "Could not subscribe");
		}
	}

	if (state === "ok") {
		return (
			<p className="flex items-center gap-2 rounded-2xl bg-brand/10 px-4 py-3.5 text-sm text-[#7fd8f7] ring-1 ring-brand/30" role="status">
				<Check className="h-4 w-4" /> You're subscribed — thank you.
			</p>
		);
	}

	return (
		<form onSubmit={submit} className="space-y-2">
			<label htmlFor="footer-email" className="sr-only">
				Email address
			</label>
			<div className="flex rounded-full bg-white/5 p-1.5 ring-1 ring-white/15 focus-within:ring-brand">
				<input
					id="footer-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Your email address"
					disabled={state === "busy"}
					className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none"
				/>
				<button
					type="submit"
					disabled={state === "busy"}
					className="flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-contrast transition hover:bg-[#4cc8f4] disabled:opacity-60"
				>
					{state === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
				</button>
			</div>
			{state === "err" && (
				<p className="px-4 text-xs text-[#ff8fa3]" role="alert">
					{msg}
				</p>
			)}
		</form>
	);
}

export function Footer() {
	const g = useContent("global");
	const nav = useContent("nav");
	const navLinks = useNavLinks();
	const { data: socials } = useApi<SocialLink[]>("/api/public/socials");
	const { data: contacts } = useApi<ContactDetail[]>("/api/public/contacts");
	const { data: offers } = useApi<Offer[]>("/api/public/offers");

	const offerLinks =
		offers && offers.length > 0
			? offers.slice(0, 4).map((o) => ({ label: o.name, href: `/offers/${o.slug}` }))
			: SERVICES_FALLBACK.map((s) => ({ label: s.name, href: "/offers" }));
	const phone = contacts?.find((c) => c.platform.toLowerCase() === "phone");
	const email = contacts?.find((c) => ["mail", "email"].includes(c.platform.toLowerCase()));

	return (
		<footer className="relative overflow-hidden bg-navy-deep text-white">
			{/* CTA band */}
			<div className="relative isolate overflow-hidden">
				<Image src="/images/port-traffic.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-30" />
				<div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/40" />
				<div className="container-x flex flex-col items-start justify-between gap-8 py-20 sm:py-24 lg:flex-row lg:items-center">
					<h2 className="max-w-3xl font-heading text-[clamp(2.25rem,4.6vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em]">
						{g.footerCtaTitle} {g.footerCtaAccent && <span className="text-brand">{g.footerCtaAccent}</span>}
					</h2>
					{g.footerCtaButton && (
						<Link
							href="/contact?subject=Request%20a%20quote"
							className="group inline-flex min-h-14 shrink-0 items-center gap-3 rounded-full bg-brand px-8 text-base font-semibold text-brand-contrast transition hover:bg-[#4cc8f4]"
						>
							{g.footerCtaButton}
							<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Link>
					)}
				</div>
			</div>

			<div className="container-x grid gap-12 border-t border-white/10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.3fr]">
				<div className="space-y-6">
					<DabelLogo tone="onDark" />
					<p className="max-w-sm text-sm leading-7 text-white/60">{g.footerDescription}</p>
					{socials && socials.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{socials.map((s) => {
								const Icon = socialIcon(s.platform);
								return (
									<a
										key={s.id}
										href={s.url}
										target={s.url.startsWith("mailto") ? undefined : "_blank"}
										rel="noopener noreferrer"
										aria-label={s.platform}
										className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-brand hover:text-brand-contrast hover:ring-brand"
									>
										<Icon className="h-4 w-4" />
									</a>
								);
							})}
						</div>
					)}
				</div>

				<nav aria-label="Footer" className="space-y-5">
					<h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7fd8f7]">{nav.footerCompanyTitle}</h3>
					<ul className="space-y-3 text-sm">
						{navLinks.map((l) => (
							<li key={l.href}>
								<Link href={l.href} className="text-white/65 transition hover:text-white">
									{l.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<div className="space-y-5">
					<h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7fd8f7]">{nav.footerOffersTitle}</h3>
					<ul className="space-y-3 text-sm">
						{offerLinks.map((s) => (
							<li key={s.label}>
								<Link href={s.href} className="text-white/65 transition hover:text-white">
									{s.label}
								</Link>
							</li>
						))}
						{phone && (
							<li className="pt-2">
								<a href={phone.url} className="text-white/65 hover:text-white">
									{phone.value}
								</a>
							</li>
						)}
						{email && (
							<li>
								<a href={email.url} className="break-all text-white/65 hover:text-white">
									{email.value}
								</a>
							</li>
						)}
					</ul>
				</div>

				<div className="space-y-5">
					<h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7fd8f7]">{g.newsletterTitle}</h3>
					<p className="text-sm leading-relaxed text-white/60">{g.newsletterText}</p>
					<Newsletter />
				</div>
			</div>

			<div className="border-t border-white/10">
				<div className="container-x flex flex-col items-start justify-between gap-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center">
					<p>
						© {new Date().getFullYear()} {g.copyright}
					</p>
					<button
						type="button"
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						className="flex min-h-11 items-center gap-2 rounded-full px-4 ring-1 ring-white/15 transition hover:text-white hover:ring-white/40"
					>
						Back to top <ArrowUp className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>
		</footer>
	);
}
