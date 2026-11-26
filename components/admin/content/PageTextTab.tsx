"use client";

import { ChevronDown, Loader2, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { btnGhost, btnPrimary, card, Field, ImageField, inputCls } from "@/components/admin/content/fields";
import { api } from "@/lib/api";
import { CONTENT_DEFAULTS, CONTENT_SECTIONS, type Content, type SectionDef } from "@/lib/content";
import { cn } from "@/lib/utils";

type Values = Record<string, string>;

function SectionEditor({
	def,
	current,
	customised,
	onSaved,
}: {
	def: SectionDef;
	current: Values;
	customised: boolean;
	onSaved: (c: Content, key: string, reset?: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<Values>(current);
	const [busy, setBusy] = useState<"save" | "reset" | null>(null);
	useEffect(() => setForm(current), [current]);

	const dirty = useMemo(() => def.fields.some((f) => (form[f.name] ?? "") !== (current[f.name] ?? "")), [form, current, def.fields]);
	const defaults = CONTENT_DEFAULTS[def.key] as Record<string, string>;

	async function save() {
		setBusy("save");
		try {
			const { data } = await api.put("/admin/content", { key: def.key, value: form });
			onSaved(data.content, def.key);
			toast.success(`${def.title} saved — live on the site now.`);
		} catch {
			toast.error("Could not save. Please try again.");
		} finally {
			setBusy(null);
		}
	}

	async function reset() {
		if (!confirm(`Reset "${def.title}" to the original text?`)) return;
		setBusy("reset");
		try {
			const { data } = await api.delete(`/admin/content?key=${def.key}`);
			onSaved(data.content, def.key, true);
			toast.success(`${def.title} reset to default.`);
		} catch {
			toast.error("Could not reset. Please try again.");
		} finally {
			setBusy(null);
		}
	}

	return (
		<section className={cn(card, "p-0 sm:p-0")}>
			<button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6">
				<span>
					<span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-ink">{def.page}</span>
					<span className="mt-1 block font-heading text-lg font-semibold text-fg">{def.title}</span>
				</span>
				<span className="flex items-center gap-3">
					{customised && <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[11px] font-semibold text-brand-ink">Edited</span>}
					<ChevronDown className={cn("h-5 w-5 text-fg-muted transition-transform", open && "rotate-180")} />
				</span>
			</button>
			{open && (
				<div className="space-y-5 border-t border-line p-5 sm:p-6">
					{def.description && <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-fg-muted">{def.description}</p>}
					<div className="grid gap-5 md:grid-cols-2">
						{def.fields.map((f) => {
							const val = form[f.name] ?? "";
							const set = (v: string) => setForm((s) => ({ ...s, [f.name]: v }));
							const wide = f.type === "textarea" || f.type === "image";
							return (
								<Field
									key={f.name}
									label={f.label}
									group={f.type === "image"}
									help={f.help ?? (val !== defaults[f.name] && f.type !== "image" ? `Default: ${defaults[f.name] || "—"}` : undefined)}
									className={wide ? "md:col-span-2" : undefined}
								>
									{f.type === "textarea" ? (
										<textarea rows={3} value={val} onChange={(e) => set(e.target.value)} className={cn(inputCls, "resize-y")} />
									) : f.type === "image" ? (
										<div className="max-w-md">
											<ImageField value={val} onChange={set} folder="page-content" allowClear={false} />
										</div>
									) : (
										<input value={val} onChange={(e) => set(e.target.value)} className={inputCls} />
									)}
								</Field>
							);
						})}
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
						<button type="button" onClick={reset} disabled={!!busy || !customised} className={btnGhost}>
							{busy === "reset" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Reset to default
						</button>
						<button type="button" onClick={save} disabled={!!busy || !dirty} className={btnPrimary}>
							{busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
						</button>
					</div>
				</div>
			)}
		</section>
	);
}

export function PageTextTab() {
	const [content, setContent] = useState<Content | null>(null);
	const [customised, setCustomised] = useState<Record<string, unknown>>({});
	const [error, setError] = useState(false);

	useEffect(() => {
		api
			.get("/admin/content")
			.then(({ data }) => {
				setContent(data.content);
				setCustomised(data.customised ?? {});
			})
			.catch(() => setError(true));
	}, []);

	if (error) return <p className={cn(card, "text-sm text-destructive")}>Could not load page content. Refresh to try again.</p>;
	if (!content)
		return (
			<div className="flex items-center gap-2 p-6 text-sm text-fg-muted">
				<Loader2 className="h-4 w-4 animate-spin" /> Loading page content…
			</div>
		);

	return (
		<div className="space-y-3">
			<p className="text-sm text-fg-muted">
				Every heading, label and header photo on the public site. Changes go live as soon as you save. Blank fields fall back to the original text.
			</p>
			{CONTENT_SECTIONS.map((def) => (
				<SectionEditor
					key={def.key}
					def={def}
					current={content[def.key] as Values}
					customised={def.key in customised}
					onSaved={(c, key, wasReset) => {
						setContent(c);
						setCustomised((s) => {
							const next = { ...s };
							if (wasReset) delete next[key];
							else next[key] = true;
							return next;
						});
					}}
				/>
			))}
		</div>
	);
}
