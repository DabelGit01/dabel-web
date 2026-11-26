"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { btnGhost, btnPrimary, card, Field, ImageField, inputCls, Switch } from "@/components/admin/content/fields";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Slide = {
	id: string;
	label: string;
	eyebrow: string;
	line1: string;
	line2: string;
	line3: string;
	accentLine: number;
	body: string;
	imageUrl: string;
	ctaLabel: string;
	ctaHref: string;
	order: number;
	published: boolean;
};
type Draft = Omit<Slide, "id" | "order"> & { id?: string };

const EMPTY: Draft = {
	label: "",
	eyebrow: "",
	line1: "",
	line2: "",
	line3: "",
	accentLine: 3,
	body: "",
	imageUrl: "",
	ctaLabel: "Explore offers",
	ctaHref: "/offers",
	published: true,
};

function errMsg(e: unknown) {
	const m = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
	return m || "Something went wrong";
}

function SlideForm({ initial, onCancel, onSaved }: { initial: Draft; onCancel: () => void; onSaved: () => void }) {
	const [d, setD] = useState<Draft>(initial);
	const [busy, setBusy] = useState(false);
	const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));
	const lines = [d.line1, d.line2, d.line3];

	async function save() {
		setBusy(true);
		try {
			const { id, ...body } = d;
			if (id) await api.patch(`/admin/hero-slides/${id}`, body);
			else await api.post("/admin/hero-slides", body);
			toast.success("Slide saved — live on the home page now.");
			onSaved();
		} catch (e) {
			toast.error(errMsg(e));
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
			<div className="space-y-4">
				<Field label="Background photo" group>
					<ImageField value={d.imageUrl} onChange={(v) => set("imageUrl", v)} folder="hero" allowClear={false} />
				</Field>
				{/* live headline preview */}
				<div className="relative overflow-hidden rounded-xl bg-navy p-5 text-white">
					{d.imageUrl && (
						// biome-ignore lint/performance/noImgElement: admin preview
						<img src={d.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
					)}
					<div className="relative">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7fd8f7]">{d.eyebrow || "Eyebrow"}</p>
						<p className="mt-2 font-heading text-2xl font-bold leading-tight">
							{lines.map((l, i) =>
								l ? (
									// biome-ignore lint/suspicious/noArrayIndexKey: positional lines
									<span key={i} className={cn("block", i + 1 === d.accentLine && "text-brand")}>
										{l}
									</span>
								) : null,
							)}
						</p>
						<p className="mt-2 line-clamp-2 text-xs text-white/70">{d.body}</p>
					</div>
				</div>
			</div>
			<div className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Slide name" help="Shown in the slide list on the right of the hero.">
						<input className={inputCls} value={d.label} onChange={(e) => set("label", e.target.value)} placeholder="Marine Logistics" />
					</Field>
					<Field label="Small label above headline">
						<input className={inputCls} value={d.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} placeholder="Marine Logistics · Since 2013" />
					</Field>
				</div>
				<div className="grid gap-4 sm:grid-cols-3">
					{(["line1", "line2", "line3"] as const).map((k, i) => (
						<Field key={k} label={`Headline line ${i + 1}`}>
							<input className={inputCls} value={d[k]} onChange={(e) => set(k, e.target.value)} />
						</Field>
					))}
				</div>
				<Field label="Highlight line in cyan">
					<div className="flex gap-2">
						{[1, 2, 3].map((n) => (
							<button
								key={n}
								type="button"
								onClick={() => set("accentLine", n)}
								className={cn("min-h-9 rounded-lg px-4 text-sm font-semibold ring-1", d.accentLine === n ? "bg-brand text-brand-contrast ring-brand" : "text-fg ring-line")}
							>
								Line {n}
							</button>
						))}
					</div>
				</Field>
				<Field label="Intro text">
					<textarea rows={3} className={cn(inputCls, "resize-y")} value={d.body} onChange={(e) => set("body", e.target.value)} />
				</Field>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Button label" help="Leave blank to hide the button.">
						<input className={inputCls} value={d.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} />
					</Field>
					<Field label="Button link" help="e.g. /offers, /offers/consultancy, /contact">
						<input className={inputCls} value={d.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} />
					</Field>
				</div>
				<Switch checked={d.published} onChange={(v) => set("published", v)} label="Show this slide on the site" />
				<div className="flex justify-end gap-2 border-t border-line pt-4">
					<button type="button" onClick={onCancel} className={btnGhost}>
						<X className="h-4 w-4" /> Cancel
					</button>
					<button type="button" onClick={save} disabled={busy} className={btnPrimary}>
						{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save slide
					</button>
				</div>
			</div>
		</div>
	);
}

export function HeroSlidesTab() {
	const [slides, setSlides] = useState<Slide[] | null>(null);
	const [editing, setEditing] = useState<string | "new" | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const load = () =>
		api
			.get("/admin/hero-slides")
			.then(({ data }) => setSlides(data))
			.catch(() => toast.error("Could not load slides"));
	useEffect(() => {
		load();
	}, []);

	async function patch(id: string, body: Partial<Slide>, msg?: string) {
		setBusyId(id);
		try {
			await api.patch(`/admin/hero-slides/${id}`, body);
			if (msg) toast.success(msg);
			await load();
		} catch (e) {
			toast.error(errMsg(e));
		} finally {
			setBusyId(null);
		}
	}

	async function move(i: number, dir: -1 | 1) {
		if (!slides) return;
		const a = slides[i];
		const b = slides[i + dir];
		if (!b) return;
		setBusyId(a.id);
		try {
			await Promise.all([api.patch(`/admin/hero-slides/${a.id}`, { order: b.order }), api.patch(`/admin/hero-slides/${b.id}`, { order: a.order })]);
			await load();
		} catch (e) {
			toast.error(errMsg(e));
		} finally {
			setBusyId(null);
		}
	}

	async function remove(s: Slide) {
		if (!confirm(`Delete the "${s.label}" slide? This can't be undone.`)) return;
		setBusyId(s.id);
		try {
			await api.delete(`/admin/hero-slides/${s.id}`);
			toast.success("Slide deleted");
			await load();
		} catch (e) {
			toast.error(errMsg(e));
		} finally {
			setBusyId(null);
		}
	}

	if (!slides)
		return (
			<div className="flex items-center gap-2 p-6 text-sm text-fg-muted">
				<Loader2 className="h-4 w-4 animate-spin" /> Loading slides…
			</div>
		);

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-fg-muted">The home page hero. Slides play in this order; hidden slides are kept but not shown.</p>
				{editing !== "new" && (
					<button type="button" onClick={() => setEditing("new")} className={btnPrimary}>
						<Plus className="h-4 w-4" /> Add slide
					</button>
				)}
			</div>

			{editing === "new" && (
				<div className={card}>
					<SlideForm
						initial={EMPTY}
						onCancel={() => setEditing(null)}
						onSaved={() => {
							setEditing(null);
							load();
						}}
					/>
				</div>
			)}

			{slides.length === 0 && editing !== "new" && (
				<p className={cn(card, "text-sm text-fg-muted")}>No slides yet — the site shows the default three until you add one.</p>
			)}

			{slides.map((s, i) => (
				<div key={s.id} className={cn(card, !s.published && "opacity-70")}>
					{editing === s.id ? (
						<SlideForm
							initial={s}
							onCancel={() => setEditing(null)}
							onSaved={() => {
								setEditing(null);
								load();
							}}
						/>
					) : (
						<div className="flex flex-wrap items-center gap-4">
							<div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-2">
								{/* biome-ignore lint/performance/noImgElement: admin thumbnail */}
								<img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
									{String(i + 1).padStart(2, "0")} · {s.label} {!s.published && "· hidden"}
								</p>
								<p className="mt-1 truncate font-heading font-semibold text-fg">{[s.line1, s.line2, s.line3].filter(Boolean).join(" ")}</p>
							</div>
							<div className="flex flex-wrap gap-1.5">
								<button type="button" title="Move up" aria-label="Move up" disabled={i === 0 || !!busyId} onClick={() => move(i, -1)} className={cn(btnGhost, "px-2.5")}>
									<ArrowUp className="h-4 w-4" />
								</button>
								<button type="button" title="Move down" aria-label="Move down" disabled={i === slides.length - 1 || !!busyId} onClick={() => move(i, 1)} className={cn(btnGhost, "px-2.5")}>
									<ArrowDown className="h-4 w-4" />
								</button>
								<button
									type="button"
									title={s.published ? "Hide" : "Show"}
									aria-label={s.published ? "Hide slide" : "Show slide"}
									disabled={!!busyId}
									onClick={() => patch(s.id, { published: !s.published }, s.published ? "Slide hidden" : "Slide visible")}
									className={cn(btnGhost, "px-2.5")}
								>
									{s.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
								<button type="button" onClick={() => setEditing(s.id)} disabled={!!busyId} className={btnGhost}>
									<Pencil className="h-4 w-4" /> Edit
								</button>
								<button type="button" title="Delete" aria-label="Delete slide" disabled={!!busyId} onClick={() => remove(s)} className={cn(btnGhost, "px-2.5 hover:text-destructive")}>
									{busyId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
								</button>
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
