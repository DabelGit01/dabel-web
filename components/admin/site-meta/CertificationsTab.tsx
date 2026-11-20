"use client";

import {
	Edit2,
	ImagePlus,
	Loader2,
	Plus,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import {
	type ChangeEvent,
	type DragEvent,
	useEffect,
	useRef,
	useState,
} from "react";
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
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { storageClient as supabase } from "@/lib/storage-client";

interface Certification {
	id: string;
	title: string;
	description: string;
	year: string;
	imageUrl?: string | null;
	order: number;
	published: boolean;
}

export default function CertificationsTab() {
	const [certs, setCerts] = useState<Certification[]>([]);
	const [loadingCerts, setLoadingCerts] = useState(true);
	const [savingCert, setSavingCert] = useState(false);
	const [certOpen, setCertOpen] = useState(false);
	const [editingCert, setEditingCert] = useState<Certification | null>(null);
	const [certForm, setCertForm] = useState({
		title: "",
		description: "",
		year: "",
		imageUrl: "",
		order: 0,
		published: true,
	});
	const [uploadingCert, setUploadingCert] = useState(false);
	const [uploadCertErr, setUploadCertErr] = useState("");
	const [certDragOver, setCertDragOver] = useState(false);
	const certFileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		async function loadCerts() {
			setLoadingCerts(true);
			try {
				const r = await api.get("/admin/certifications");
				setCerts(r.data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoadingCerts(false);
			}
		}

		loadCerts();
	}, []);

	async function uploadCertImage(file: File) {
		if (!file.type.startsWith("image/")) {
			setUploadCertErr("Please select a valid image file.");
			return;
		}
		if (!supabase) {
			setUploadCertErr("Supabase not configured.");
			return;
		}
		setUploadingCert(true);
		setUploadCertErr("");
		try {
			const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
			const base =
				file.name
					.replace(/\.[^/.]+$/, "")
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.slice(0, 40) || "cert";
			const path = `certifications/${Date.now()}-${crypto.randomUUID()}-${base}.${ext}`;
			const { error } = await supabase.storage
				.from("dabel-media")
				.upload(path, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type,
				});
			if (error) throw error;
			const { data } = supabase.storage.from("dabel-media").getPublicUrl(path);
			setCertForm((f) => ({ ...f, imageUrl: data.publicUrl }));
			toast.success("Certification badge uploaded.");
		} catch {
			setUploadCertErr(
				"Upload failed. Check your Supabase bucket and try again.",
			);
		} finally {
			setUploadingCert(false);
		}
	}

	function onCertFileChange(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) uploadCertImage(file);
		e.target.value = "";
	}

	function onCertDragOver(e: DragEvent<HTMLButtonElement>) {
		e.preventDefault();
		setCertDragOver(true);
	}

	function onCertDragLeave() {
		setCertDragOver(false);
	}

	function onCertDrop(e: DragEvent<HTMLButtonElement>) {
		e.preventDefault();
		setCertDragOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) uploadCertImage(file);
	}

	function openCreateCert() {
		setEditingCert(null);
		setCertForm({
			title: "",
			description: "",
			year: "",
			imageUrl: "",
			order: certs.length + 1,
			published: true,
		});
		setUploadCertErr("");
		setCertOpen(true);
	}

	function openEditCert(c: Certification) {
		setEditingCert(c);
		setCertForm({
			title: c.title,
			description: c.description,
			year: c.year,
			imageUrl: c.imageUrl || "",
			order: c.order,
			published: c.published,
		});
		setUploadCertErr("");
		setCertOpen(true);
	}

	async function handleDeleteCert(id: string) {
		try {
			const res = await fetch(`/api/admin/certifications/${id}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setCerts((prev) => prev.filter((c) => c.id !== id));
				toast.success("Certification deleted.");
			}
		} catch {
			toast.error("Failed to delete certification.");
		}
	}

	async function handleCertSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSavingCert(true);
		const payload = { ...certForm, order: Number(certForm.order) };
		try {
			const url = editingCert
				? `/admin/certifications/${editingCert.id}`
				: "/admin/certifications";
			const res = editingCert
				? await api.patch(url, payload)
				: await api.post(url, payload);
			const saved = res.data;
			if (res.status === 200 || res.status === 201) {
				setCerts((prev) =>
					editingCert
						? prev.map((c) => (c.id === saved.id ? saved : c))
						: [...prev, saved],
				);
				setCertOpen(false);
				toast.success("Certification saved.");
			}
		} catch {
			toast.error("Failed to save certification.");
		} finally {
			setSavingCert(false);
		}
	}

	return (
		<>
			<TabsContent value="certs">
				<div className="flex justify-between items-center mb-4">
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
						Manage certification stamps &amp; awards
					</p>
					<Button
						onClick={openCreateCert}
						size="sm"
						className="rounded-none bg-black text-white hover:bg-[var(--color-accent)] hover:text-white font-semibold text-xs uppercase tracking-wider cursor-pointer"
					>
						<Plus className="mr-1 h-3.5 w-3.5" /> Add Certification
					</Button>
				</div>

				<div className="border border-black/8 bg-white">
					{loadingCerts ? (
						<div className="py-16 text-center text-sm text-black/35 font-['JetBrains_Mono']">
							Loading certifications...
						</div>
					) : certs.length === 0 ? (
						<div className="py-16 text-center text-sm text-black/25 font-['JetBrains_Mono']">
							No certifications found. Add one above.
						</div>
					) : (
						<Table>
							<TableHeader className="bg-black/2">
								<TableRow>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide">
										Title
									</TableHead>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide">
										Details
									</TableHead>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide">
										Year
									</TableHead>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide text-center">
										Status
									</TableHead>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide text-right">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{certs.map((c) => (
									<TableRow key={c.id}>
										<TableCell className="font-semibold text-[#0A0A0A]">
											{c.title}
										</TableCell>
										<TableCell className="text-xs text-black/50 max-w-[240px] truncate">
											{c.description}
										</TableCell>
										<TableCell className="text-xs font-['JetBrains_Mono'] text-orange-600 font-semibold">
											{c.year}
										</TableCell>
										<TableCell className="text-center">
											<span
												className={`px-2 py-0.5 font-['JetBrains_Mono'] text-[0.52rem] uppercase tracking-wide ${c.published ? "bg-[var(--color-accent)] text-white" : "border border-black/10 text-black/35"}`}
											>
												{c.published ? "Live" : "Draft"}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1.5">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openEditCert(c)}
													className="rounded-none border-black/10 h-7 text-xs px-2 hover:border-[#0A0A0A]"
												>
													<Edit2 className="h-3 w-3" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															className="rounded-none border-black/10 h-7 text-xs px-2 text-black/35 hover:text-red-500 hover:border-red-200 cursor-pointer"
														>
															<Trash2 className="h-3.5 w-3.5" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
														<AlertDialogHeader className="border-b border-black/8 px-6 py-4">
															<AlertDialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-[#0A0A0A]">
																Delete Certification
															</AlertDialogTitle>
															<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
																This action cannot be undone. The certification
																&quot;{c.title}&quot; will be permanently
																removed.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter className="px-6 py-4">
															<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDeleteCert(c.id)}
																className="rounded-none bg-red-600 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-red-700"
															>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</TabsContent>

			{/* Certifications Dialog */}
			<Dialog open={certOpen} onOpenChange={setCertOpen}>
				<DialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
					<DialogHeader className="border-b border-black/8 px-6 py-4">
						<DialogTitle className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							{editingCert ? "Edit Certification" : "New Certification"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={handleCertSubmit}
						className="space-y-4 p-6 w-full min-w-0"
					>
						<div>
							<label
								htmlFor="title"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Title *
							</label>
							<Input
								id="title"
								required
								value={certForm.title}
								onChange={(e) =>
									setCertForm({ ...certForm, title: e.target.value })
								}
								placeholder="e.g. ISO 9001"
								className="rounded-none text-sm text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="DetailsDescription"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Details / Description *
							</label>
							<Textarea
								id="DetailsDescription"
								required
								value={certForm.description}
								onChange={(e) =>
									setCertForm({ ...certForm, description: e.target.value })
								}
								placeholder="Who certified, validity context..."
								rows={3}
								className="rounded-none resize-none text-[#0A0A0A]"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="YearBadge"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Year/Badge *
								</label>
								<Input
									id="YearBadge"
									required
									value={certForm.year}
									onChange={(e) =>
										setCertForm({ ...certForm, year: e.target.value })
									}
									placeholder="e.g. Certified 2024"
									className="rounded-none text-[#0A0A0A]"
								/>
							</div>
							<div>
								<label
									htmlFor="DisplayOrder"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Display Order
								</label>
								<Input
									id="DisplayOrder"
									type="number"
									value={certForm.order}
									onChange={(e) =>
										setCertForm({ ...certForm, order: Number(e.target.value) })
									}
									className="rounded-none text-[#0A0A0A]"
								/>
							</div>
						</div>
						{/* Badge Upload */}
						<div>
							<label
								htmlFor="CertificationBadgeImage"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Certification Badge / Image
							</label>
							<input
								id="CertificationBadgeImage"
								ref={certFileRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={onCertFileChange}
							/>
							{certForm.imageUrl ? (
								<div className="relative mb-2 flex items-center gap-3 border border-black/10 p-3 bg-white w-full min-w-0">
									<div className="relative h-14 w-14 shrink-0 overflow-hidden border border-black/8">
										<img
											src={certForm.imageUrl}
											alt="Badge Preview"
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-xs text-black/50">
											{certForm.imageUrl}
										</p>
									</div>
									<button
										type="button"
										onClick={() => setCertForm((f) => ({ ...f, imageUrl: "" }))}
										className="shrink-0 p-1 text-black/30 hover:text-red-500 cursor-pointer"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => certFileRef.current?.click()}
									onDragOver={onCertDragOver}
									onDragLeave={onCertDragLeave}
									onDrop={onCertDrop}
									aria-label="Upload badge image"
									className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed py-6 transition-colors bg-white ${certDragOver ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-black/10 hover:border-black/25"}`}
								>
									{uploadingCert ? (
										<Upload className="h-5 w-5 animate-bounce text-black/30" />
									) : (
										<ImagePlus className="h-5 w-5 text-black/25" />
									)}
									<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.18em] text-black/35">
										{uploadingCert
											? "Uploading..."
											: "Click or drag to upload badge image"}
									</p>
								</button>
							)}
							{uploadCertErr && (
								<p className="mt-1.5 text-xs text-red-500 font-['JetBrains_Mono']">
									{uploadCertErr}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="OptionalImageURL"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Optional Image URL
							</label>
							<Input
								id="OptionalImageURL"
								value={certForm.imageUrl}
								onChange={(e) =>
									setCertForm({ ...certForm, imageUrl: e.target.value })
								}
								placeholder="e.g. /badge.png"
								className="rounded-none text-xs text-[#0A0A0A]"
							/>
						</div>
						<div className="flex items-center gap-2 pt-2">
							<input
								type="checkbox"
								id="published-cert"
								checked={certForm.published}
								onChange={(e) =>
									setCertForm({ ...certForm, published: e.target.checked })
								}
								className="h-4 w-4 accent-black"
							/>
							<label
								htmlFor="published-cert"
								className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/50 select-none"
							>
								Publish Immediately
							</label>
						</div>
						<DialogFooter className="pt-4 border-t border-black/5">
							<Button
								type="button"
								variant="outline"
								onClick={() => setCertOpen(false)}
								className="rounded-none h-10 border-black/10"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={savingCert}
								className="rounded-none bg-[#0A0A0A] text-white hover:bg-[var(--color-accent)] hover:text-white cursor-pointer"
							>
								{savingCert ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Save Certification
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
