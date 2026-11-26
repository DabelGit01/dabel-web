"use client";

import { Gem, Images, Type } from "lucide-react";
import { useState } from "react";
import { HeroSlidesTab } from "@/components/admin/content/HeroSlidesTab";
import { PageTextTab } from "@/components/admin/content/PageTextTab";
import { ValuesTab } from "@/components/admin/content/ValuesTab";
import { cn } from "@/lib/utils";

const TABS = [
	{ id: "hero", label: "Hero Slides", icon: Images },
	{ id: "values", label: "Values", icon: Gem },
	{ id: "text", label: "Page Text", icon: Type },
] as const;

export default function PageContentAdmin() {
	const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("hero");

	return (
		<div className="max-w-6xl space-y-6">
			<div>
				<p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-fg-muted">Website</p>
				<h1 className="font-heading text-2xl font-bold tracking-tight text-fg md:text-3xl">Page Content</h1>
				<p className="mt-2 max-w-2xl text-sm text-fg-muted">
					Edit what visitors see: the home hero, company values, and every heading, label and header photo across the site. Changes go live as soon as you save.
				</p>
			</div>

			<div role="tablist" aria-label="Content sections" className="flex flex-wrap gap-1 rounded-2xl bg-surface p-1.5 ring-1 ring-line">
				{TABS.map((t) => (
					<button
						key={t.id}
						type="button"
						role="tab"
						aria-selected={tab === t.id}
						onClick={() => setTab(t.id)}
						className={cn(
							"inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
							tab === t.id ? "bg-navy text-white dark:bg-white dark:text-navy" : "text-fg-muted hover:text-fg",
						)}
					>
						<t.icon className="h-4 w-4" /> {t.label}
					</button>
				))}
			</div>

			<div role="tabpanel">
				{tab === "hero" && <HeroSlidesTab />}
				{tab === "values" && <ValuesTab />}
				{tab === "text" && <PageTextTab />}
			</div>
		</div>
	);
}
