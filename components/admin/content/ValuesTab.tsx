"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { btnGhost, btnPrimary, card, Field, ImageField, inputCls, Switch } from "@/components/admin/content/fields";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Value = { id: string; name: string; body: string; images: string[]; order: number; published: boolean };
type Draft = Omit<Value, "id" | "order"> & { id?: string };

const EMPTY: Draft = { name: "", body: "", images: [], published: true };

function errMsg(e: unknown) {
	return (e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Something went wrong";
}

function ValueForm({ initial, onCancel, onSaved }: { initial: Draft; onCancel: () => void; onSaved: () => void }) {
	const [d, setD] = useState<Draft>({ ...initial, images: [...initial.images] });
	const [busy, setBusy] = useState(false);
	const slots = [0, 1, 2];

	function setImage(i: number, url: string) {
		setD((s) => {
			const imgs = [...s.images];
			imgs[i] = url;
			return { ...s, images: imgs };
		});
	}

	async function save() {
		setBusy(true);
		try {
			const { id, ...body } = d;
			const payload = { ...body, images: body.images.filter(Boolean) };
			if (id) await api.patch(`/admin/values/${id}`, payload);
			else await api.post("/admin/values", payload);
			toast.success("Value saved — live on the site now.");
			onSaved();
		} catch (e) {
			toast.error(errMsg(e));
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-[1fr_2fr]">
				<Field label="Value name">
					<input className={inputCls} value={d.name} onChange={(e) => setD((s) => ({ ...s, name: e.target.value }))} placeholder="Speed" />
				</Field>
				<Field label="Description">
					<textarea rows={3} className={cn(inputCls, "resize-y")} value={d.body} onChange={(e) => setD((s) => ({ ...s, body: e.target.value }))} />
				</Field>
			</div>
			<Field label="Photos (up to 3, shown on the home page)" group>
				<div className="grid gap-4 sm:grid-cols-3">
					{slots.map((i) => (
						<ImageField key={i} value={d.images[i] ?? ""} onChange={(v) => setImage(i, v)} folder="values" aspect="aspect-[16/10]" />
					))}
				</div>
			</Field>
			<Switch checked={d.published} onChange={(v) => setD((s) => ({ ...s, published: v }))} label="Show this value on the site" />
			<div className="flex justify-end gap-2 border-t border-line pt-4">
				<button type="button" onClick={onCancel} className={btnGhost}>
					<X className="h-4 w-4" /> Cancel
				</button>
				<button type="button" onClick={save} disabled={busy} className={btnPrimary}>
					{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save value
				</button>
			</div>
		</div>
	);
}

export function ValuesTab() {
	const [values, setValues] = useState<Value[] | null>(null);
	const [editing, setEditing] = useState<string | "new" | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const load = () =>
		api
			.get("/admin/values")
			.then(({ data }) => setValues(data))
			.catch(() => toast.error("Could not load values"));
	useEffect(() => {
		load();
	}, []);

	async function run(id: string, fn: () => Promise<unknown>, msg?: string) {
		setBusyId(id);
		try {
			await fn();
			if (msg) toast.success(msg);
			await load();
		} catch (e) {
			toast.error(errMsg(e));
		} finally {
			setBusyId(null);
		}
	}

	if (!values)
		return (
			<div className="flex items-center gap-2 p-6 text-sm text-fg-muted">
				<Loader2 className="h-4 w-4 animate-spin" /> Loading values…
			</div>
		);

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-fg-muted">"Our Values | Guiding Principles" — shown on the home page (with photos) and the About page.</p>
				{editing !== "new" && (
					<button type="button" onClick={() => setEditing("new")} className={btnPrimary}>
						<Plus className="h-4 w-4" /> Add value
					</button>
				)}
			</div>

			{editing === "new" && (
				<div className={card}>
					<ValueForm initial={EMPTY} onCancel={() => setEditing(null)} onSaved={() => (setEditing(null), load())} />
				</div>
			)}

			{values.map((v, i) => (
				<div key={v.id} className={cn(card, !v.published && "opacity-70")}>
					{editing === v.id ? (
						<ValueForm initial={v} onCancel={() => setEditing(null)} onSaved={() => (setEditing(null), load())} />
					) : (
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex -space-x-3">
								{v.images.slice(0, 3).map((src) => (
									// biome-ignore lint/performance/noImgElement: admin thumbnail
									<img key={src} src={src} alt="" className="h-12 w-12 rounded-lg object-cover ring-2 ring-surface" />
								))}
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-heading font-semibold text-fg">
									{v.name} {!v.published && <span className="text-xs font-normal text-fg-muted">· hidden</span>}
								</p>
								<p className="mt-0.5 line-clamp-1 text-sm text-fg-muted">{v.body}</p>
							</div>
							<div className="flex flex-wrap gap-1.5">
								<button
									type="button"
									aria-label="Move up"
									disabled={i === 0 || !!busyId}
									onClick={() =>
										run(v.id, () =>
											Promise.all([api.patch(`/admin/values/${v.id}`, { order: values[i - 1].order }), api.patch(`/admin/values/${values[i - 1].id}`, { order: v.order })]),
										)
									}
									className={cn(btnGhost, "px-2.5")}
								>
									<ArrowUp className="h-4 w-4" />
								</button>
								<button
									type="button"
									aria-label="Move down"
									disabled={i === values.length - 1 || !!busyId}
									onClick={() =>
										run(v.id, () =>
											Promise.all([api.patch(`/admin/values/${v.id}`, { order: values[i + 1].order }), api.patch(`/admin/values/${values[i + 1].id}`, { order: v.order })]),
										)
									}
									className={cn(btnGhost, "px-2.5")}
								>
									<ArrowDown className="h-4 w-4" />
								</button>
								<button
									type="button"
									aria-label={v.published ? "Hide value" : "Show value"}
									disabled={!!busyId}
									onClick={() => run(v.id, () => api.patch(`/admin/values/${v.id}`, { published: !v.published }), v.published ? "Value hidden" : "Value visible")}
									className={cn(btnGhost, "px-2.5")}
								>
									{v.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
								<button type="button" onClick={() => setEditing(v.id)} disabled={!!busyId} className={btnGhost}>
									<Pencil className="h-4 w-4" /> Edit
								</button>
								<button
									type="button"
									aria-label="Delete value"
									disabled={!!busyId}
									onClick={() => confirm(`Delete "${v.name}"?`) && run(v.id, () => api.delete(`/admin/values/${v.id}`), "Value deleted")}
									className={cn(btnGhost, "px-2.5 hover:text-destructive")}
								>
									{busyId === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
								</button>
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
