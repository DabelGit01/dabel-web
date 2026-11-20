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
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { storageClient as supabase } from "@/lib/storage-client";

interface TeamMember {
	id: string;
	name: string;
	role: string;
	title: string;
	bio: string | null;
	imageUrl: string | null;
	linkedin: string | null;
	order: number;
}

const emptyTeamForm = {
	name: "",
	role: "",
	title: "",
	bio: "",
	imageUrl: "",
	linkedin: "",
	order: 0,
};

export default function TeamMembersTab() {
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [loadingTeam, setLoadingTeam] = useState(true);
	const [savingTeam, setSavingTeam] = useState(false);
	const [teamOpen, setTeamOpen] = useState(false);
	const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
	const [teamForm, setTeamForm] = useState(emptyTeamForm);
	const [uploadingTeam, setUploadingTeam] = useState(false);
	const [uploadTeamErr, setUploadTeamErr] = useState("");
	const [teamDragOver, setTeamDragOver] = useState(false);
	const teamFileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		async function loadTeamMembers() {
			setLoadingTeam(true);
			try {
				const r = await api.get("/admin/team");
				setTeamMembers(r.data);
			} catch (_e) {
				toast.error("Failed to load team members.");
			} finally {
				setLoadingTeam(false);
			}
		}

		loadTeamMembers();
	}, []);

	function openCreateTeam() {
		setEditingTeam(null);
		setTeamForm(emptyTeamForm);
		setUploadTeamErr("");
		setTeamOpen(true);
	}

	function openEditTeam(m: TeamMember) {
		setEditingTeam(m);
		setTeamForm({
			name: m.name,
			role: m.role,
			title: m.title,
			bio: m.bio ?? "",
			imageUrl: m.imageUrl ?? "",
			linkedin: m.linkedin ?? "",
			order: m.order,
		});
		setUploadTeamErr("");
		setTeamOpen(true);
	}

	async function uploadTeamImage(file: File) {
		if (!file.type.startsWith("image/")) {
			setUploadTeamErr("Please select a valid image file.");
			return;
		}
		if (!supabase) {
			setUploadTeamErr("Supabase not configured.");
			return;
		}
		setUploadingTeam(true);
		setUploadTeamErr("");
		try {
			const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
			const base =
				file.name
					.replace(/\.[^/.]+$/, "")
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.slice(0, 40) || "team";
			const path = `team/${Date.now()}-${crypto.randomUUID()}-${base}.${ext}`;
			const { error } = await supabase.storage
				.from("dabel-media")
				.upload(path, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type,
				});
			if (error) throw error;
			const { data } = supabase.storage.from("dabel-media").getPublicUrl(path);
			setTeamForm((f) => ({ ...f, imageUrl: data.publicUrl }));
			toast.success("Team photo uploaded.");
		} catch {
			setUploadTeamErr(
				"Upload failed. Check your Supabase bucket and try again.",
			);
		} finally {
			setUploadingTeam(false);
		}
	}

	function onTeamFileChange(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) uploadTeamImage(file);
		e.target.value = "";
	}

	function onTeamDragOver(e: DragEvent<HTMLButtonElement>) {
		e.preventDefault();
		setTeamDragOver(true);
	}

	function onTeamDragLeave() {
		setTeamDragOver(false);
	}

	function onTeamDrop(e: DragEvent<HTMLButtonElement>) {
		e.preventDefault();
		setTeamDragOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) uploadTeamImage(file);
	}

	async function handleDeleteTeam(id: string) {
		try {
			await api.delete(`/admin/team/${id}`);
			setTeamMembers((prev) => prev.filter((m) => m.id !== id));
			toast.success("Team member deleted.");
		} catch (err: any) {
			console.error(err);
			toast.error(err.response?.data?.error || "Failed to delete team member.");
		}
	}

	async function handleTeamSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSavingTeam(true);
		try {
			const payload = {
				...teamForm,
				order: Number(teamForm.order),
				bio: teamForm.bio || undefined,
				imageUrl: teamForm.imageUrl || undefined,
				linkedin: teamForm.linkedin || undefined,
			};
			const url = editingTeam ? `/admin/team/${editingTeam.id}` : "/admin/team";
			const res = editingTeam
				? await api.patch(url, payload)
				: await api.post(url, payload);
			const saved = res.data;
			if (res.status === 200 || res.status === 201) {
				setTeamMembers((prev) =>
					editingTeam
						? prev.map((x) => (x.id === saved.id ? saved : x))
						: [...prev, saved],
				);
				setTeamOpen(false);
				toast.success("Team member saved.");
			} else {
				throw new Error();
			}
		} catch {
			toast.error("Failed to save team member.");
		} finally {
			setSavingTeam(false);
		}
	}

	return (
		<>
			<TabsContent value="team">
				<div className="flex justify-between items-center mb-4">
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
						Manage team members &amp; roles
					</p>
					<Button
						onClick={openCreateTeam}
						size="sm"
						className="rounded-none bg-black text-white hover:bg-[var(--color-accent)] hover:text-white font-semibold text-xs uppercase tracking-wider cursor-pointer"
					>
						<Plus className="mr-1 h-3.5 w-3.5" /> Add Member
					</Button>
				</div>

				{loadingTeam ? (
					<div className="py-16 text-center text-sm text-black/35 font-['JetBrains_Mono']">
						Loading team members...
					</div>
				) : teamMembers.length === 0 ? (
					<div className="py-16 text-center text-sm text-black/25 font-['JetBrains_Mono']">
						No team members found. Add one above.
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{teamMembers.map((m) => (
							<div key={m.id} className="border border-black/8 bg-white p-4">
								<div className="mb-3 flex items-center gap-3">
									{m.imageUrl ? (
										<div className="relative h-12 w-12 shrink-0 overflow-hidden border border-black/8">
											<img
												src={m.imageUrl}
												alt={m.name}
												className="h-full w-full object-cover"
											/>
										</div>
									) : (
										<div className="flex h-12 w-12 shrink-0 items-center justify-center border border-black/8 bg-[var(--color-accent)]">
											<span className="font-['Playfair_Display'] text-base font-black text-white">
												{m.name.charAt(0).toUpperCase()}
											</span>
										</div>
									)}
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-black text-[#0A0A0A]">
											{m.name}
										</p>
										<p className="truncate text-xs font-medium text-black/50">
											{m.title}
										</p>
									</div>
								</div>
								<div className="mb-3 flex items-center gap-1.5">
									<span className="border border-black/10 px-2 py-0.5 font-['JetBrains_Mono'] text-[0.5rem] uppercase tracking-wide text-black/40">
										{m.role}
									</span>
									<span className="font-['JetBrains_Mono'] text-[0.55rem] text-black/25">
										#{m.order}
									</span>
								</div>
								{m.bio && (
									<p className="line-clamp-2 text-xs text-black/40 mb-3">
										{m.bio}
									</p>
								)}
								<div className="flex items-center gap-1.5 border-t border-black/5 pt-3">
									<Button
										variant="outline"
										size="sm"
										onClick={() => openEditTeam(m)}
										className="rounded-none border-black/10 h-7 text-xs px-2 hover:border-[#0A0A0A] gap-1"
									>
										<Edit2 className="h-3 w-3" /> Edit
									</Button>
									{m.linkedin && (
										<a
											href={m.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-1.5 border border-black/8 px-3 py-1.5 text-xs font-semibold text-black/40 hover:text-[#0A0A0A] transition-colors"
										>
											LinkedIn
										</a>
									)}
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="rounded-none border-black/10 h-7 text-xs px-2 text-black/35 hover:text-red-500 hover:border-red-200 ml-auto cursor-pointer"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
											<AlertDialogHeader className="border-b border-black/8 px-6 py-4">
												<AlertDialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-[#0A0A0A]">
													Delete Team Member
												</AlertDialogTitle>
												<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
													This action cannot be undone. The team member &quot;
													{m.name}&quot; will be permanently removed.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter className="px-6 py-4">
												<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleDeleteTeam(m.id)}
													className="rounded-none bg-red-600 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-red-700"
												>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						))}
					</div>
				)}
			</TabsContent>

			{/* Team Member Dialog */}
			<Dialog open={teamOpen} onOpenChange={setTeamOpen}>
				<DialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
					<DialogHeader className="border-b border-black/8 px-6 py-4">
						<DialogTitle className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							{editingTeam ? "Edit Member" : "New Team Member"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={handleTeamSubmit}
						className="space-y-4 p-6 w-full min-w-0"
					>
						<div>
							<label
								htmlFor="team-name"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Name *
							</label>
							<Input
								id="team-name"
								required
								value={teamForm.name}
								onChange={(e) =>
									setTeamForm({ ...teamForm, name: e.target.value })
								}
								placeholder="Full name"
								className="rounded-none text-[#0A0A0A]"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="team-role"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Role *
								</label>
								<Input
									id="team-role"
									required
									value={teamForm.role}
									onChange={(e) =>
										setTeamForm({ ...teamForm, role: e.target.value })
									}
									placeholder="e.g. Director, Engineer"
									className="rounded-none text-[#0A0A0A]"
								/>
							</div>
							<div>
								<label
									htmlFor="team-title"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Title *
								</label>
								<Input
									id="team-title"
									required
									value={teamForm.title}
									onChange={(e) =>
										setTeamForm({ ...teamForm, title: e.target.value })
									}
									placeholder="Job title"
									className="rounded-none text-[#0A0A0A]"
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="team-bio"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Bio
							</label>
							<Textarea
								id="team-bio"
								value={teamForm.bio}
								onChange={(e) =>
									setTeamForm({ ...teamForm, bio: e.target.value })
								}
								rows={3}
								className="rounded-none resize-none text-[#0A0A0A]"
								placeholder="Short biography..."
							/>
						</div>
						{/* Photo upload */}
						<div>
							<label
								htmlFor="team-photo"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Profile Photo
							</label>
							<input
								ref={teamFileRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={onTeamFileChange}
							/>
							{teamForm.imageUrl ? (
								<div className="relative mb-2 flex items-center gap-3 border border-black/10 p-3 bg-white w-full min-w-0">
									<div className="relative h-14 w-14 shrink-0 overflow-hidden border border-black/8">
										<img
											src={teamForm.imageUrl}
											alt="Preview"
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-xs text-black/50">
											{teamForm.imageUrl}
										</p>
									</div>
									<button
										type="button"
										onClick={() => setTeamForm((f) => ({ ...f, imageUrl: "" }))}
										className="shrink-0 p-1 text-black/30 hover:text-red-500 cursor-pointer"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => teamFileRef.current?.click()}
									onDragOver={onTeamDragOver}
									onDragLeave={onTeamDragLeave}
									onDrop={onTeamDrop}
									aria-label="Upload team member photo"
									className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed py-6 transition-colors bg-white ${teamDragOver ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-black/10 hover:border-black/25"}`}
								>
									{uploadingTeam ? (
										<Upload className="h-5 w-5 animate-bounce text-black/30" />
									) : (
										<ImagePlus className="h-5 w-5 text-black/25" />
									)}
									<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.18em] text-black/35">
										{uploadingTeam
											? "Uploading..."
											: "Click or drag to upload photo"}
									</p>
								</button>
							)}
							{uploadTeamErr && (
								<p className="mt-1.5 text-xs text-red-500 font-['JetBrains_Mono']">
									{uploadTeamErr}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="team-linkedin"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								LinkedIn URL
							</label>
							<Input
								id="team-linkedin"
								value={teamForm.linkedin}
								onChange={(e) =>
									setTeamForm({ ...teamForm, linkedin: e.target.value })
								}
								placeholder="https://linkedin.com/in/..."
								className="rounded-none text-sm text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="team-order"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Display Order
							</label>
							<Input
								id="team-order"
								type="number"
								value={teamForm.order}
								onChange={(e) =>
									setTeamForm({ ...teamForm, order: Number(e.target.value) })
								}
								className="rounded-none text-[#0A0A0A]"
							/>
						</div>
						<DialogFooter className="pt-4 border-t border-black/5">
							<Button
								type="button"
								variant="outline"
								onClick={() => setTeamOpen(false)}
								className="rounded-none h-10 border-black/10"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={savingTeam || uploadingTeam}
								className="rounded-none bg-[#0A0A0A] text-white hover:bg-[var(--color-accent)] hover:text-white cursor-pointer"
							>
								{savingTeam ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Save Member
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
