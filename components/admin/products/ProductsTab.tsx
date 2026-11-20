"use client";

import {
	Edit2,
	Eye,
	EyeOff,
	Loader2,
	Package,
	Plus,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import { storageClient as supabase } from "@/lib/storage-client";

interface Product {
	id: string;
	slug: string;
	name: string;
	category: string;
	status: string;
	description: string;
	subTopic: string;
	price: number | null;
	purchaseUrl: string | null;
	imageUrl: string | null;
	galleryUrls?: string[] | null;
	gallery?: { url: string; title: string }[] | null;
	tags: string[];
	published: boolean;
	order: number;
}

const CATEGORIES = ["Software", "Hardware", "Service", "Subscription", "Other"];
const STATUSES = ["Available", "Coming Soon", "Discontinued", "Beta"];

function toSlug(s: string) {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

const emptyForm = {
	name: "",
	slug: "",
	category: "Software",
	status: "Available",
	description: "",
	subTopic: "",
	price: "",
	purchaseUrl: "",
	imageUrl: "",
	galleryUrls: [] as string[],
	gallery: [] as { url: string; title: string }[],
	tags: "",
	published: true,
	order: 0,
};

interface Props {
	products: Product[];
	setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
	loading: boolean;
}

export default function ProductsTab({ products, setProducts, loading }: Props) {
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Product | null>(null);
	const [form, setForm] = useState(emptyForm);
	const [slugManual, setSlugManual] = useState(false);
	const [saving, setSaving] = useState(false);
	const [uploadingOffer, setUploadingOffer] = useState(false);
	const [offerDragOver, setOfferDragOver] = useState(false);
	const [offerUploadErr, setOfferUploadErr] = useState("");
	const offerFileRef = useRef<HTMLInputElement>(null);

	async function uploadImage(file: File) {
		if (!file.type.startsWith("image/")) {
			setOfferUploadErr("Please select a valid image file.");
			return;
		}
		if (!supabase) {
			setOfferUploadErr("Supabase not configured.");
			return;
		}
		setUploadingOffer(true);
		setOfferUploadErr("");
		try {
			const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
			const base =
				file.name
					.replace(/\.[^/.]+$/, "")
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.slice(0, 40) || "offer-image";
			const path = `offers/${Date.now()}-${crypto.randomUUID()}-${base}.${ext}`;
			const { error } = await supabase.storage
				.from("dabel-media")
				.upload(path, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type,
				});
			if (error) throw error;
			const { data } = supabase.storage.from("dabel-media").getPublicUrl(path);
			setForm((f) => ({ ...f, imageUrl: data.publicUrl }));
			toast.success("Image uploaded successfully.");
		} catch (err) {
			console.error(err);
			setOfferUploadErr("Upload failed. Ensure the storage bucket exists.");
		} finally {
			setUploadingOffer(false);
		}
	}

	function openCreate() {
		setEditing(null);
		setForm(emptyForm);
		setSlugManual(false);
		setOpen(true);
	}

	function openEdit(p: Product) {
		setEditing(p);
		setForm({
			name: p.name,
			slug: p.slug,
			category: p.category,
			status: p.status,
			description: p.description,
			subTopic: p.subTopic ?? "",
			price: p.price?.toString() ?? "",
			purchaseUrl: p.purchaseUrl ?? "",
			imageUrl: p.imageUrl ?? "",
			galleryUrls: p.galleryUrls ?? [],
			gallery: p.gallery ?? [],
			tags: p.tags.join(", "),
			published: p.published,
			order: p.order,
		});
		setSlugManual(true);
		setOpen(true);
	}

	async function handleDelete(id: string) {
		try {
			await api.delete(`/admin/offers/${id}`);
			setProducts((prev) => prev.filter((p) => p.id !== id));
			toast.success("Offer deleted successfully.");
		} catch (err: any) {
			console.error("Failed to delete offer", err);
			toast.error("Failed to delete offer.");
		}
	}

	async function togglePublish(p: Product) {
		try {
			const res = await api.patch(`/admin/offers/${p.id}`, {
				published: !p.published,
			});
			const u = res.data;
			setProducts((prev) => prev.map((x) => (x.id === u.id ? u : x)));
			toast.success(
				u.published ? "Offer published." : "Offer reverted to draft.",
			);
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to toggle status.");
		}
	}

	function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
		const name = e.target.value;
		setForm((f) => ({ ...f, name, slug: slugManual ? f.slug : toSlug(name) }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (uploadingOffer) return;
		setSaving(true);
		const price =
			form.price.trim() === "" ? null : parseFloat(form.price.trim());
		const tags = form.tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);
		const payload = {
			name: form.name,
			slug: form.slug,
			category: form.category,
			status: form.status,
			description: form.description,
			subTopic: form.subTopic,
			price: Number.isNaN(price) ? null : price,
			purchaseUrl: form.purchaseUrl || undefined,
			imageUrl: form.imageUrl || undefined,
			galleryUrls: form.galleryUrls,
			gallery: form.gallery,
			tags,
			published: form.published,
			order: Number(form.order),
		};
		try {
			const url = editing ? `/admin/offers/${editing.id}` : "/admin/offers";
			const res = editing
				? await api.patch(url, payload)
				: await api.post(url, payload);
			const saved = res.data;
			setProducts((prev) =>
				editing
					? prev.map((x) => (x.id === saved.id ? saved : x))
					: [saved, ...prev],
			);
			setOpen(false);
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to save offer.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<>
			<div className="flex justify-between items-center mb-4">
				<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
					Manage offers catalogue
				</p>
				<button
					type="button"
					onClick={openCreate}
					className="flex items-center gap-2 bg-[#0A0A0A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-accent)] hover:text-white transition-colors cursor-pointer"
				>
					<Plus className="h-4 w-4" /> Add Offer
				</button>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-16 text-sm text-black/35 font-['JetBrains_Mono']">
					Loading...
				</div>
			) : products.length === 0 ? (
				<div className="flex flex-col items-center justify-center border border-dashed border-black/10 py-16 text-center">
					<Package className="mb-3 h-8 w-8 text-black/15" />
					<p className="text-sm font-semibold text-black/40">No offers yet</p>
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((p) => (
						<div key={p.id} className="group border border-black/8 bg-white">
							{p.imageUrl ? (
								<div className="relative aspect-video overflow-hidden bg-black/5">
									<Image
										src={p.imageUrl}
										alt={p.name}
										fill
										className="object-cover transition-transform group-hover:scale-105"
										sizes="400px"
									/>
								</div>
							) : (
								<div className="flex aspect-video items-center justify-center bg-[var(--color-accent)]/5">
									<Package className="h-8 w-8 text-[var(--color-accent)]" />
								</div>
							)}
							<div className="p-4">
								<div className="mb-2 flex flex-wrap items-start justify-between gap-2">
									<h3 className="font-['Playfair_Display'] text-sm font-black text-[#0A0A0A]">
										{p.name}
									</h3>
									<div className="flex items-center gap-1.5">
										<span className="border border-black/10 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[0.48rem] uppercase tracking-wide text-black/35">
											{p.status}
										</span>
										<span
											className={`px-2 py-0.5 font-['JetBrains_Mono'] text-[0.52rem] uppercase tracking-wide ${
												p.published
													? "bg-[var(--color-accent)] text-white"
													: "border border-black/10 text-black/35"
											}`}
										>
											{p.published ? "Live" : "Draft"}
										</span>
									</div>
								</div>
								<p className="mb-1.5 font-['JetBrains_Mono'] text-[0.6rem] text-black/35">
									{p.category}
								</p>
								<p className="line-clamp-2 text-xs text-black/45 mb-3">
									{p.description}
								</p>
								{p.price !== null && (
									<p className="font-['JetBrains_Mono'] text-xs font-bold text-[#0A0A0A] mb-1">
										${p.price}
									</p>
								)}
								{p.tags.length > 0 && (
									<div className="mb-3 flex flex-wrap gap-1">
										{p.tags.slice(0, 3).map((t) => (
											<span
												key={t}
												className="border border-black/8 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[0.48rem] uppercase tracking-wide text-black/35"
											>
												{t}
											</span>
										))}
										{p.tags.length > 3 && (
											<span className="font-['JetBrains_Mono'] text-[0.48rem] text-black/25">
												+{p.tags.length - 3}
											</span>
										)}
									</div>
								)}
								<div className="flex items-center gap-1.5 border-t border-black/5 pt-3">
									<button
										type="button"
										onClick={() => openEdit(p)}
										className="flex items-center gap-1.5 border border-black/8 px-3 py-1.5 text-xs font-semibold text-black/60 hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors cursor-pointer"
									>
										<Edit2 className="h-3 w-3" /> Edit
									</button>
									<button
										type="button"
										onClick={() => togglePublish(p)}
										className="flex items-center gap-1.5 border border-black/8 px-3 py-1.5 text-xs font-semibold text-black/60 hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors cursor-pointer"
									>
										{p.published ? (
											<EyeOff className="h-3 w-3" />
										) : (
											<Eye className="h-3 w-3" />
										)}
										{p.published ? "Unpublish" : "Publish"}
									</button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<button
												type="button"
												className="ml-auto p-1.5 text-black/25 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</AlertDialogTrigger>
										<AlertDialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
											<AlertDialogHeader className="border-b border-black/8 px-6 py-4">
												<AlertDialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-[#0A0A0A]">
													Delete Product
												</AlertDialogTitle>
												<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
													This action cannot be undone. The product &quot;
													{p.name}&quot; will be permanently removed.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter className="px-6 py-4">
												<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleDelete(p.id)}
													className="rounded-none bg-red-600 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-red-700"
												>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Products Dialog Modal */}
			{open && (
				<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
					<div className="my-8 w-full max-w-xl border border-black/8 bg-white">
						<div className="flex items-center justify-between border-b border-black/8 px-6 py-4">
							<h2 className="font-['Playfair_Display'] text-base font-black uppercase text-[#0A0A0A]">
								{editing ? "Edit Offer" : "New Offer"}
							</h2>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="p-1 text-black/30 hover:text-black"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<form onSubmit={handleSubmit} className="space-y-4 p-6">
							<div>
								<label
									htmlFor="product-name"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Name *
								</label>
								<input
									id="product-name"
									required
									value={form.name}
									onChange={handleNameChange}
									className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
									placeholder="Product name"
								/>
							</div>
							<div>
								<label
									htmlFor="product-slug"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Slug *
								</label>
								<input
									id="product-slug"
									required
									value={form.slug}
									onChange={(e) => {
										setSlugManual(true);
										setForm({ ...form, slug: e.target.value });
									}}
									className="w-full border border-black/10 px-3 py-2.5 font-['JetBrains_Mono'] text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
									placeholder="url-friendly-slug"
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label
										htmlFor="product-category"
										className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
									>
										Category
									</label>
									<select
										id="product-category"
										value={form.category}
										onChange={(e) =>
											setForm({ ...form, category: e.target.value })
										}
										className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
									>
										{CATEGORIES.map((c) => (
											<option key={c}>{c}</option>
										))}
									</select>
								</div>
								<div>
									<label
										htmlFor="product-status"
										className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
									>
										Status
									</label>
									<select
										id="product-status"
										value={form.status}
										onChange={(e) =>
											setForm({ ...form, status: e.target.value })
										}
										className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
									>
										{STATUSES.map((s) => (
											<option key={s}>{s}</option>
										))}
									</select>
								</div>
							</div>
							<div>
								<label
									htmlFor="product-subTopic"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Subtopic *
								</label>
								<input
									type="text"
									id="product-subTopic"
									required
									value={form.subTopic}
									onChange={(e) =>
										setForm({ ...form, subTopic: e.target.value })
									}
									className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
									placeholder="Product tagline/subtopic..."
								/>
							</div>
							<div>
								<label
									htmlFor="product-description"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Description *
								</label>
								<textarea
									id="product-description"
									required
									value={form.description}
									onChange={(e) =>
										setForm({ ...form, description: e.target.value })
									}
									rows={4}
									className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none resize-none"
									placeholder="Product description..."
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label
										htmlFor="product-price"
										className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
									>
										Price (USD)
									</label>
									<input
										id="product-price"
										value={form.price}
										onChange={(e) =>
											setForm({ ...form, price: e.target.value })
										}
										className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
										placeholder="e.g. 99.99"
									/>
								</div>
								<div>
									<label
										htmlFor="product-order"
										className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
									>
										Display Order
									</label>
									<input
										id="product-order"
										type="number"
										value={form.order}
										onChange={(e) =>
											setForm({ ...form, order: Number(e.target.value) })
										}
										className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
									/>
								</div>
							</div>
							<div>
								<label
									htmlFor="product-purchase-url"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Purchase URL
								</label>
								<input
									id="product-purchase-url"
									value={form.purchaseUrl}
									onChange={(e) =>
										setForm({ ...form, purchaseUrl: e.target.value })
									}
									className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
									placeholder="https://..."
								/>
							</div>
							<div>
								<label
									htmlFor="product-image"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Image *
								</label>
								<div
									role="button"
									tabIndex={0}
									onClick={() => offerFileRef.current?.click()}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											offerFileRef.current?.click();
										}
									}}
									onDragOver={(e) => {
										e.preventDefault();
										setOfferDragOver(true);
									}}
									onDragLeave={() => setOfferDragOver(false)}
									onDrop={(e) => {
										e.preventDefault();
										setOfferDragOver(false);
										const f = e.dataTransfer.files?.[0];
										if (f) uploadImage(f);
									}}
									className={`w-full border-2 border-dashed rounded p-6 flex flex-col items-center justify-center transition-all bg-white cursor-pointer ${
										offerDragOver
											? "border-[#001a3d] bg-slate-50"
											: "border-black/10 hover:border-black/25"
									}`}
								>
									{form.imageUrl ? (
										<div className="relative w-full aspect-[21/9] rounded overflow-hidden group">
											<img
												src={form.imageUrl}
												alt="Preview"
												className="object-cover h-full w-full"
											/>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setForm((f) => ({ ...f, imageUrl: "" }));
												}}
												className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									) : (
										<div className="text-center space-y-2">
											<Upload className="h-8 w-8 text-black/25 mx-auto" />
											<p className="text-sm font-medium text-gray-500">
												Drag and drop your image, or{" "}
												<span className="text-[#001a3d] hover:underline font-bold cursor-pointer">
													browse
												</span>
											</p>
											<p className="text-[0.62rem] text-gray-400 uppercase tracking-wider font-['JetBrains_Mono']">
												PNG, JPG, WEBP up to 5MB
											</p>
										</div>
									)}
									<input
										id="product-image"
										type="file"
										ref={offerFileRef}
										onChange={(e) => {
											const f = e.target.files?.[0];
											if (f) uploadImage(f);
										}}
										accept="image/*"
										className="hidden"
									/>
								</div>
								{uploadingOffer && (
									<div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-['JetBrains_Mono']">
										<Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading
										image...
									</div>
								)}
								{offerUploadErr && (
									<p className="text-xs text-red-500 mt-1 font-['JetBrains_Mono']">
										{offerUploadErr}
									</p>
								)}
							</div>
							<div className="space-y-3">
								<div className="flex justify-between items-center border-b border-black/5 pb-2">
									<label className="block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40">
										Image Gallery (Optional)
									</label>
									<button
										type="button"
										onClick={() => {
											setForm((f) => ({
												...f,
												gallery: [...(f.gallery || []), { url: "", title: "" }],
											}));
										}}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-black border border-black/10 hover:border-black transition-colors"
									>
										+ Add Additional Image
									</button>
								</div>

								{form.gallery && form.gallery.length > 0 ? (
									<div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
										{form.gallery.map((item, idx) => (
											<div
												key={idx}
												className="flex gap-4 items-center bg-slate-50 border border-black/5 p-3 rounded-md group relative"
											>
												{/* Image Upload/Preview Box */}
												<div className="relative h-16 w-16 bg-white border border-black/10 rounded flex items-center justify-center shrink-0 overflow-hidden">
													{item.url ? (
														<>
															<img
																src={item.url}
																alt="Gallery preview"
																className="h-full w-full object-cover"
															/>
															<button
																type="button"
																onClick={() => {
																	setForm((f) => ({
																		...f,
																		gallery: f.gallery.map((g, i) =>
																			i === idx ? { ...g, url: "" } : g,
																		),
																	}));
																}}
																className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[0.55rem] font-bold uppercase tracking-wider cursor-pointer"
															>
																Change
															</button>
														</>
													) : (
														<label className="cursor-pointer h-full w-full flex flex-col items-center justify-center hover:bg-slate-100/50 transition-colors">
															<Upload className="h-4 w-4 text-black/25 animate-pulse" />
															<span className="text-[0.5rem] font-bold text-gray-400 uppercase mt-0.5 tracking-wider">
																Upload
															</span>
															<input
																type="file"
																onChange={async (e) => {
																	const file = e.target.files?.[0];
																	if (!file?.type.startsWith("image/")) return;
																	if (!supabase) {
																		setOfferUploadErr(
																			"Storage client not initialized.",
																		);
																		return;
																	}
																	setUploadingOffer(true);
																	setOfferUploadErr("");
																	try {
																		const ext =
																			file.name
																				.split(".")
																				.pop()
																				?.toLowerCase() || "jpg";
																		const base =
																			file.name
																				.replace(/\.[^/.]+$/, "")
																				.toLowerCase()
																				.replace(/[^a-z0-9]+/g, "-")
																				.slice(0, 40) || "gallery";
																		const path = `offer-gallery/${Date.now()}-${crypto.randomUUID()}-${base}.${ext}`;
																		const { error } = await supabase.storage
																			.from("dabel-media")
																			.upload(path, file, {
																				cacheControl: "3600",
																				upsert: false,
																				contentType: file.type,
																			});
																		if (error) throw error;
																		const { data } = supabase.storage
																			.from("dabel-media")
																			.getPublicUrl(path);
																		setForm((f) => ({
																			...f,
																			gallery: f.gallery.map((g, i) =>
																				i === idx
																					? { ...g, url: data.publicUrl }
																					: g,
																			),
																		}));
																		toast.success("Image uploaded.");
																	} catch (err) {
																		console.error(err);
																		setOfferUploadErr(
																			"Upload failed. Please check bucket policies.",
																		);
																	} finally {
																		setUploadingOffer(false);
																	}
																}}
																accept="image/*"
																className="hidden"
															/>
														</label>
													)}
												</div>

												{/* Image Title Input */}
												<div className="flex-1">
													<label className="mb-0.5 block font-['JetBrains_Mono'] text-[0.55rem] uppercase tracking-[0.2em] text-black/40">
														Image Title
													</label>
													<input
														type="text"
														required
														value={item.title}
														onChange={(e) => {
															const newTitle = e.target.value;
															setForm((f) => ({
																...f,
																gallery: f.gallery.map((g, i) =>
																	i === idx ? { ...g, title: newTitle } : g,
																),
															}));
														}}
														className="w-full border border-black/10 px-2 py-1.5 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
														placeholder="Enter title/caption..."
													/>
												</div>

												{/* Delete Row Button */}
												<button
													type="button"
													onClick={() => {
														setForm((f) => ({
															...f,
															gallery: f.gallery.filter((_, i) => i !== idx),
														}));
													}}
													className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors shrink-0 cursor-pointer"
													title="Delete Image Row"
												>
													<X className="h-4 w-4" />
												</button>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-6 border border-dashed border-black/10 rounded text-[0.65rem] font-medium text-gray-400 uppercase tracking-wider">
										No gallery images added yet. Click "+ Add Additional Image"
										to start.
									</div>
								)}
								{offerUploadErr && (
									<p className="text-xs text-red-500 font-['JetBrains_Mono'] mt-1">
										{offerUploadErr}
									</p>
								)}
							</div>
							<div>
								<label
									htmlFor="product-tags"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Tags (comma separated)
								</label>
								<input
									id="product-tags"
									value={form.tags}
									onChange={(e) => setForm({ ...form, tags: e.target.value })}
									className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
									placeholder="satellite, tracking, software"
								/>
							</div>
							<div className="flex items-center gap-2.5">
								<button
									type="button"
									onClick={() =>
										setForm({ ...form, published: !form.published })
									}
									aria-pressed={form.published}
									aria-label={
										form.published ? "Mark as draft" : "Mark as published"
									}
									className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors border-0 p-0 ${
										form.published ? "bg-[var(--color-accent)]" : "bg-black/15"
									}`}
								>
									<div
										className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform pointer-events-none ${
											form.published ? "translate-x-4" : "translate-x-0.5"
										}`}
									/>
								</button>
								<span className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/50">
									{form.published ? "Published" : "Draft"}
								</span>
							</div>
							<button
								type="submit"
								disabled={saving || uploadingOffer}
								className="w-full bg-[#0A0A0A] py-3 font-['Playfair_Display'] text-sm font-black uppercase tracking-[0.06em] text-white hover:bg-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
							>
								{saving
									? "Saving..."
									: editing
										? "Save Changes"
										: "Create Offer"}
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
