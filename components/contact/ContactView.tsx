"use client";

import { Globe, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ContactForm, SUBJECTS } from "@/components/contact/ContactForm";
import { useContent } from "@/components/site/ContentProvider";
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { useApi } from "@/hooks/use-api";
import { SITE } from "@/lib/site";
import type { ContactDetail } from "@/lib/types";

const FALLBACK: ContactDetail[] = [
	{ id: "p1", platform: "phone", label: "Call us", value: SITE.phones[0], url: `tel:${SITE.phones[0].replace(/\s/g, "")}` },
	{ id: "p2", platform: "phone", label: "Operations line", value: SITE.phones[1], url: `tel:${SITE.phones[1].replace(/\s/g, "")}` },
	{ id: "m1", platform: "mail", label: "Email", value: SITE.emails[0], url: `mailto:${SITE.emails[0]}` },
	{ id: "m2", platform: "mail", label: "Alternate email", value: SITE.emails[1], url: `mailto:${SITE.emails[1]}` },
];

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
	mail: Mail,
	email: Mail,
	phone: Phone,
	whatsapp: MessageCircle,
	linkedin: Linkedin,
	address: MapPin,
};

function FormWithParams({ successMessage }: { successMessage: string }) {
	const sp = useSearchParams();
	const s = sp.get("subject");
	const service = sp.get("service");
	const subject = SUBJECTS.find((x) => x.toLowerCase() === s?.toLowerCase());
	return (
		<ContactForm
			successMessage={successMessage}
			defaults={{
				subject: subject ?? (service ? "Request a quote" : undefined),
				message: service ? `I'd like to request: ${service}.\n\nLocation / timeline: ` : undefined,
			}}
		/>
	);
}

export function ContactView() {
	const c = useContent("contact");
	const { data } = useApi<ContactDetail[]>("/api/public/contacts", FALLBACK);
	const contacts = data ?? FALLBACK;

	return (
		<section className="bg-bg py-20 sm:py-28">
			<div className="container-x grid gap-14 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
				<div>
					<SectionHeading title={c.sectionTitle} subtitle={c.sectionSubtitle} intro={c.sectionIntro} />
					<ul className="mt-10 space-y-3">
						{contacts.map((c, i) => {
							const Icon = icons[c.platform.toLowerCase().trim()] ?? Globe;
							return (
								<Reveal as="li" key={c.id} delay={i * 0.05}>
									<a
										href={c.url}
										target={c.url.startsWith("http") ? "_blank" : undefined}
										rel="noopener noreferrer"
										className="group flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-line transition hover:ring-brand"
									>
										<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-white transition group-hover:bg-brand group-hover:text-brand-contrast">
											<Icon className="h-5 w-5" />
										</span>
										<span className="min-w-0">
											<span className="block text-xs font-semibold uppercase tracking-[0.16em] text-fg-muted">{c.label}</span>
											<span className="block break-all font-semibold text-fg">{c.value}</span>
										</span>
									</a>
								</Reveal>
							);
						})}
					</ul>
				</div>

				<Reveal delay={0.1} className="rounded-[2rem] bg-surface p-6 ring-1 ring-line sm:p-10">
					<h2 className="font-heading text-2xl font-semibold tracking-tight text-fg">{c.formTitle}</h2>
					{c.formNote && <p className="mt-2 text-fg-muted">{c.formNote}</p>}
					<div className="mt-8">
						<FormWithParams successMessage={c.successMessage} />
					</div>
				</Reveal>
			</div>
		</section>
	);
}
