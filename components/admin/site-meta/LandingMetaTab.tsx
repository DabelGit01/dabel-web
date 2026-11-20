"use client";

import { ImagePlus, Loader2, Save, Upload, X } from "lucide-react";
import {
	type ChangeEvent,
	type DragEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { storageClient as supabase } from "@/lib/storage-client";

interface SiteMeta {
	welcomeSubtitle: string;
	welcomeTitle: string;
	welcomeBody1: string;
	welcomeBody2: string;
	aboutHistory: string;
	founderName: string;
	founderRole: string;
	founderBio: string;
	founderImageUrl?: string | null;
	aboutHeader: string;
	aboutBody: string;
	aboutMission: string;
	aboutVision: string;
	enquiryText: string;
}

export default function LandingMetaTab() {
	const [loadingMeta, setLoadingMeta] = useState(true);
	const [savingMeta, setSavingMeta] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadErr, setUploadErr] = useState("");
	const [dragOver, setDragOver] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	const [meta, setMeta] = useState<SiteMeta>({
		welcomeSubtitle: "",
		welcomeTitle: "",
		welcomeBody1: "",
		welcomeBody2: "",
		aboutHistory: "",
		founderName: "",
		founderRole: "",
		founderBio: "",
		founderImageUrl: "",
		aboutHeader: "",
		aboutBody: "",
		aboutMission: "",
		aboutVision: "",
		enquiryText: "",
	});

	useEffect(() => {
		async function loadMeta() {
			setLoadingMeta(true);
			try {
				const r = await api.get("/admin/site-meta");
				const data = r.data;
				setMeta({
					welcomeSubtitle: data.welcomeSubtitle || "",
					welcomeTitle: data.welcomeTitle || "",
					welcomeBody1: data.welcomeBody1 || "",
					welcomeBody2: data.welcomeBody2 || "",
					aboutHistory: data.aboutHistory || "",
					founderName: data.founderName || "",
					founderRole: data.founderRole || "",
					founderBio: data.founderBio || "",
					founderImageUrl: data.founderImageUrl || "",
					aboutHeader: data.aboutHeader || "",
					aboutBody: data.aboutBody || "",
					aboutMission: data.aboutMission || "",
					aboutVision: data.aboutVision || "",
					enquiryText: data.enquiryText || "",
				});
			} catch (_e) {
				toast.error("Failed to load site metadata.");
			} finally {
				setLoadingMeta(false);
			}
		}

		loadMeta();
	}, []);

	async function uploadFounderImage(file: File) {
		if (!file.type.startsWith("image/")) {
			setUploadErr("Please select a valid image file.");
			return;
		}
		if (!supabase) {
			setUploadErr("Supabase not configured.");
			return;
		}
		setUploading(true);
		setUploadErr("");
		try {
			const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
			const path = `founder/${Date.now()}-${crypto.randomUUID()}.${ext}`;
			const { error } = await supabase.storage
				.from("dabel-media")
				.upload(path, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type,
				});
			if (error) throw error;
			const { data } = supabase.storage.from("dabel-media").getPublicUrl(path);
			setMeta((prev) => ({ ...prev, founderImageUrl: data.publicUrl }));
			toast.success("Profile photo uploaded.");
		} catch (_err) {
			setUploadErr("Upload failed. Check your Supabase bucket and try again.");
		} finally {
			setUploading(false);
		}
	}

	function onFileChange(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) uploadFounderImage(file);
		e.target.value = "";
	}

	function onDragOver(e: DragEvent<HTMLButtonElement>) {
		e.preventDefault();
		setDragOver(true);
	}

	function onDragLeave() {
		setDragOver(false);
	}

	function onDrop(e: DragEvent<HTMLButtonElement>) {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) uploadFounderImage(file);
	}

	async function handleSaveMeta(e: React.FormEvent) {
		e.preventDefault();
		setSavingMeta(true);
		try {
			await api.patch("/admin/site-meta", meta);
			toast.success("Site metadata saved successfully.");
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to save site metadata.");
		} finally {
			setSavingMeta(false);
		}
	}

	return (
		<TabsContent value="meta">
			{loadingMeta ? (
				<div className="py-16 text-center text-sm text-black/35 font-['JetBrains_Mono']">
					Loading Meta Data...
				</div>
			) : (
				<form
					onSubmit={handleSaveMeta}
					className="border border-black/8 bg-white p-6 space-y-5 w-full min-w-0"
				>
					<div className="border-b border-black/5 pb-4 pt-4 mb-4">
						<h3 className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							Welcome Section
						</h3>
					</div>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="WelcomeSubtitle"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Welcome Subtitle
							</label>
							<Input
								id="WelcomeSubtitle"
								required
								value={meta.welcomeSubtitle}
								onChange={(e) =>
									setMeta({ ...meta, welcomeSubtitle: e.target.value })
								}
								className="rounded-none font-['JetBrains_Mono'] text-xs text-orange-600 border-black/10 focus:border-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="WelcomeTitle"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Welcome Title
							</label>
							<Input
								id="WelcomeTitle"
								required
								value={meta.welcomeTitle}
								onChange={(e) =>
									setMeta({ ...meta, welcomeTitle: e.target.value })
								}
								className="rounded-none font-semibold text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="WelcomeBodyParagraph1"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Welcome Body Paragraph 1
							</label>
							<Textarea
								id="WelcomeBodyParagraph1"
								required
								value={meta.welcomeBody1}
								onChange={(e) =>
									setMeta({ ...meta, welcomeBody1: e.target.value })
								}
								rows={4}
								className="rounded-none resize-none text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="WelcomeBodyParagraph2"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Welcome Body Paragraph 2
							</label>
							<Textarea
								id="WelcomeBodyParagraph1"
								required
								value={meta.welcomeBody2}
								onChange={(e) =>
									setMeta({ ...meta, welcomeBody2: e.target.value })
								}
								rows={4}
								className="rounded-none resize-none text-[#0A0A0A]"
							/>
						</div>
					</div>

					<div className="border-b border-black/5 pb-4 pt-4 mb-4">
						<h3 className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							About &amp; Company History
						</h3>
					</div>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="CompanyHistoryContent"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Company History Content
							</label>
							<Textarea
								id="CompanyHistoryContent"
								required
								value={meta.aboutHistory}
								onChange={(e) =>
									setMeta({ ...meta, aboutHistory: e.target.value })
								}
								rows={4}
								className="rounded-none resize-none text-[#0A0A0A]"
								placeholder="Founded in 2013 and registered with the CAC..."
							/>
						</div>
						<div>
							<label
								htmlFor="AboutBody"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								About Section Description
							</label>
							<Textarea
								id="AboutBody"
								required
								value={meta.aboutBody}
								onChange={(e) =>
									setMeta({ ...meta, aboutBody: e.target.value })
								}
								rows={4}
								className="rounded-none resize-none text-[#0A0A0A]"
								placeholder="Dabel Resources Ventures Limited is a leading provider..."
							/>
						</div>
						<div>
							<label
								htmlFor="AboutMission"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Our Mission Content
							</label>
							<Textarea
								id="AboutMission"
								required
								value={meta.aboutMission}
								onChange={(e) =>
									setMeta({ ...meta, aboutMission: e.target.value })
								}
								rows={4}
								className="rounded-none resize-none text-[#0A0A0A]"
								placeholder="To revolutionize modern day technology across Africa..."
							/>
						</div>
						<div>
							<label
								htmlFor="AboutVision"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Our Vision Content
							</label>
							<Textarea
								id="AboutVision"
								required
								value={meta.aboutVision}
								onChange={(e) =>
									setMeta({ ...meta, aboutVision: e.target.value })
								}
								rows={4}
								className="rounded-none resize-none text-[#0A0A0A]"
								placeholder="To become Africa's leading technology company..."
							/>
						</div>
					</div>

					<div className="border-b border-black/5 pb-4 pt-4 mb-4">
						<h3 className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							Our Founder
						</h3>
					</div>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="FounderName"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Founder Name
								</label>
								<Input
									id="FounderName"
									required
									value={meta.founderName}
									onChange={(e) =>
										setMeta({ ...meta, founderName: e.target.value })
									}
									className="rounded-none font-semibold text-[#0A0A0A]"
									placeholder="Dr. Samuel Adebayo"
								/>
							</div>
							<div>
								<label
									htmlFor="FounderRoleTitle"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Founder Role/Title
								</label>
								<Input
									id="FounderRoleTitle"
									required
									value={meta.founderRole}
									onChange={(e) =>
										setMeta({ ...meta, founderRole: e.target.value })
									}
									className="rounded-none font-semibold text-[#0A0A0A]"
									placeholder="Founder &amp; Chief Engineering Officer"
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="FounderBiographyDescription"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Founder Biography/Description
							</label>
							<Textarea
								id="FounderBiographyDescription"
								required
								value={meta.founderBio}
								onChange={(e) =>
									setMeta({ ...meta, founderBio: e.target.value })
								}
								rows={5}
								className="rounded-none resize-none text-[#0A0A0A]"
								placeholder="Dr. Samuel Adebayo brings over two decades of engineering..."
							/>
						</div>
						<div>
							<label
								htmlFor="FounderProfilePhoto"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Founder Profile Photo
							</label>
							<input
								id="FounderProfilePhoto"
								ref={fileRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={onFileChange}
							/>
							{meta.founderImageUrl ? (
								<div className="relative mb-2 flex items-center gap-3 border border-black/10 p-3 bg-white w-full min-w-0">
									<div className="relative h-14 w-14 shrink-0 overflow-hidden border border-black/8">
										<img
											src={meta.founderImageUrl}
											alt="Founder Preview"
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-xs text-black/50">
											{meta.founderImageUrl}
										</p>
									</div>
									<button
										type="button"
										onClick={() =>
											setMeta((prev) => ({ ...prev, founderImageUrl: "" }))
										}
										className="shrink-0 p-1 text-black/30 hover:text-red-500 cursor-pointer"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => fileRef.current?.click()}
									onDragOver={onDragOver}
									onDragLeave={onDragLeave}
									onDrop={onDrop}
									aria-label="Upload founder image"
									className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed py-8 transition-colors bg-white ${dragOver ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-black/10 hover:border-black/25"}`}
								>
									{uploading ? (
										<Upload className="h-5 w-5 animate-bounce text-black/30" />
									) : (
										<ImagePlus className="h-5 w-5 text-black/25" />
									)}
									<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.18em] text-black/35">
										{uploading
											? "Uploading..."
											: "Click or drag to upload photo"}
									</p>
								</button>
							)}
							{uploadErr && (
								<p className="mt-1.5 text-xs text-red-500 font-['JetBrains_Mono']">
									{uploadErr}
								</p>
							)}
						</div>
					</div>

					<div className="border-b border-black/5 pb-4 pt-4 mb-4">
						<h3 className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							Offers Page Configuration
						</h3>
					</div>

					<div className="grid grid-cols-1 gap-5">
						<div>
							<label className="mb-1.5 block font-['JetBrains_Mono'] text-[0.62rem] uppercase tracking-[0.2em] text-black/40">
								Enquiry Card Description
							</label>
							<Textarea
								value={meta.enquiryText}
								onChange={(e) =>
									setMeta((prev) => ({ ...prev, enquiryText: e.target.value }))
								}
								rows={4}
								className="w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
								placeholder="Enter description text for the More Enquiry card on the offers page..."
							/>
						</div>
					</div>

					<div className="pt-6 flex justify-end">
						<Button
							type="submit"
							disabled={savingMeta}
							className="rounded-none bg-[#0A0A0A] text-white hover:bg-[var(--color-accent)] hover:text-white font-['Playfair_Display'] font-black uppercase tracking-wider cursor-pointer"
						>
							{savingMeta ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Save Site Settings
						</Button>
					</div>
				</form>
			)}
		</TabsContent>
	);
}
