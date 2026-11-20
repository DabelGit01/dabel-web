"use client";

import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { api } from "@/lib/api";

interface SocialLink {
	id: string;
	platform: string;
	url: string;
	published: boolean;
}

export default function SocialLinksTab() {
	const [socials, setSocials] = useState<SocialLink[]>([]);
	const [loadingSocials, setLoadingSocials] = useState(true);
	const [savingSocial, setSavingSocial] = useState(false);
	const [socialOpen, setSocialOpen] = useState(false);
	const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
	const [socialForm, setSocialForm] = useState({
		platform: "",
		url: "",
		published: true,
	});

	useEffect(() => {
		async function loadSocials() {
			setLoadingSocials(true);
			try {
				const r = await api.get("/admin/socials");
				setSocials(r.data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoadingSocials(false);
			}
		}

		loadSocials();
	}, []);

	function openCreateSocial() {
		setEditingSocial(null);
		setSocialForm({ platform: "", url: "", published: true });
		setSocialOpen(true);
	}

	function openEditSocial(s: SocialLink) {
		setEditingSocial(s);
		setSocialForm({ platform: s.platform, url: s.url, published: s.published });
		setSocialOpen(true);
	}

	async function handleDeleteSocial(id: string) {
		try {
			await api.delete(`/admin/socials/${id}`);
			setSocials((prev) => prev.filter((s) => s.id !== id));
			toast.success("Social link deleted.");
		} catch (err: any) {
			console.error(err);
			toast.error(err.response?.data?.error || "Failed to delete social link.");
		}
	}

	async function handleSocialSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSavingSocial(true);
		try {
			const url = editingSocial
				? `/admin/socials/${editingSocial.id}`
				: "/admin/socials";
			const res = editingSocial
				? await api.patch(url, socialForm)
				: await api.post(url, socialForm);
			const saved = res.data;
			setSocials((prev) =>
				editingSocial
					? prev.map((s) => (s.id === saved.id ? saved : s))
					: [...prev, saved],
			);
			setSocialOpen(false);
			toast.success("Social link saved.");
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to save social link.");
		} finally {
			setSavingSocial(false);
		}
	}

	return (
		<>
			<TabsContent value="socials">
				<div className="flex justify-between items-center mb-4">
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
						Manage social media links for footer
					</p>
					<Button
						onClick={openCreateSocial}
						size="sm"
						className="rounded-none bg-black text-white hover:bg-[var(--color-accent)] hover:text-white font-semibold text-xs uppercase tracking-wider cursor-pointer"
					>
						<Plus className="mr-1 h-3.5 w-3.5" /> Add Social Link
					</Button>
				</div>

				<div className="border border-black/8 bg-white">
					{loadingSocials ? (
						<div className="py-16 text-center text-sm text-black/35 font-['JetBrains_Mono']">
							Loading social links...
						</div>
					) : socials.length === 0 ? (
						<div className="py-16 text-center text-sm text-black/25 font-['JetBrains_Mono']">
							No social links found. Add one above.
						</div>
					) : (
						<Table>
							<TableHeader className="bg-black/2">
								<TableRow>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide">
										Platform
									</TableHead>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide">
										URL
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
								{socials.map((s) => (
									<TableRow key={s.id}>
										<TableCell className="font-semibold uppercase text-xs font-['JetBrains_Mono'] tracking-wider text-[#0A0A0A]">
											{s.platform}
										</TableCell>
										<TableCell className="text-xs text-blue-600 underline font-['JetBrains_Mono'] truncate max-w-[320px]">
											{s.url}
										</TableCell>
										<TableCell className="text-center">
											<span
												className={`px-2 py-0.5 font-['JetBrains_Mono'] text-[0.52rem] uppercase tracking-wide ${s.published ? "bg-[var(--color-accent)] text-white" : "border border-black/10 text-black/35"}`}
											>
												{s.published ? "Live" : "Draft"}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1.5">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openEditSocial(s)}
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
																Delete Social Link
															</AlertDialogTitle>
															<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
																This action cannot be undone. The social link
																platform &quot;{s.platform}&quot; will be
																permanently removed.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter className="px-6 py-4">
															<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDeleteSocial(s.id)}
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

			{/* Social Links Dialog */}
			<Dialog open={socialOpen} onOpenChange={setSocialOpen}>
				<DialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
					<DialogHeader className="border-b border-black/8 px-6 py-4">
						<DialogTitle className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							{editingSocial ? "Edit Social Link" : "New Social Link"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={handleSocialSubmit}
						className="space-y-4 p-6 w-full min-w-0"
					>
						<div>
							<label
								htmlFor="PlatformName"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Platform Name *
							</label>
							<Input
								id="PlatformName"
								required
								value={socialForm.platform}
								onChange={(e) =>
									setSocialForm({ ...socialForm, platform: e.target.value })
								}
								placeholder="e.g. facebook, linkedin, twitter"
								className="rounded-none text-sm text-[#0A0A0A]"
							/>
							<p className="mt-1 font-['JetBrains_Mono'] text-[0.52rem] text-black/35 uppercase">
								Lucide icons automatically map based on platform name matches
								(e.g. &quot;linkedin&quot; or &quot;linkedin-icon&quot; to
								LinkedIn).
							</p>
						</div>
						<div>
							<label
								htmlFor="ProfilePlatformURL"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Profile / Platform URL *
							</label>
							<Input
								id="ProfilePlatformURL"
								required
								type="url"
								value={socialForm.url}
								onChange={(e) =>
									setSocialForm({ ...socialForm, url: e.target.value })
								}
								placeholder="https://..."
								className="rounded-none text-sm text-[#0A0A0A] font-['JetBrains_Mono']"
							/>
						</div>
						<div className="flex items-center gap-2 pt-2">
							<input
								type="checkbox"
								id="published-social"
								checked={socialForm.published}
								onChange={(e) =>
									setSocialForm({ ...socialForm, published: e.target.checked })
								}
								className="h-4 w-4 accent-black"
							/>
							<label
								htmlFor="published-social"
								className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/50 select-none"
							>
								Publish Immediately
							</label>
						</div>
						<DialogFooter className="pt-4 border-t border-black/5">
							<Button
								type="button"
								variant="outline"
								onClick={() => setSocialOpen(false)}
								className="rounded-none h-10 border-black/10"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={savingSocial}
								className="rounded-none bg-[#0A0A0A] text-white hover:bg-[var(--color-accent)] hover:text-white cursor-pointer"
							>
								{savingSocial ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Save Link
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
