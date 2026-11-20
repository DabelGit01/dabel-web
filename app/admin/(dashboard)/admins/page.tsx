"use client";

import {
	AlertCircle,
	Check,
	Edit2,
	Key,
	Loader2,
	Plus,
	Shield,
	ShieldCheck,
	Trash2,
	Users,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";

interface Admin {
	id: string;
	fullName: string;
	email: string;
	permissions: string[];
}

interface Permission {
	id: string;
	name: string;
	path: string;
}

export default function AdminsManagementPage() {
	const [activeTab, setActiveTab] = useState<"admins" | "permissions">(
		"admins",
	);
	const [admins, setAdmins] = useState<Admin[]>([]);
	const [permissions, setPermissions] = useState<Permission[]>([]);
	const [loadingAdmins, setLoadingAdmins] = useState(true);
	const [loadingPermissions, setLoadingPermissions] = useState(true);

	// New permission form state
	const [newPermName, setNewPermName] = useState("");
	const [newPermPath, setNewPermPath] = useState("");
	const [submittingPerm, setSubmittingPerm] = useState(false);

	// Edit permissions modal state
	const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [updatingAdmin, setUpdatingAdmin] = useState(false);

	// Alert Dialog Confirmation state
	const [alertDialogOpen, setAlertDialogOpen] = useState(false);
	const [alertDialogConfig, setAlertDialogConfig] = useState<{
		title: string;
		description: string;
		action: () => void;
	} | null>(null);

	function triggerConfirmation(
		title: string,
		description: string,
		onConfirm: () => void,
	) {
		setAlertDialogConfig({ title, description, action: onConfirm });
		setAlertDialogOpen(true);
	}

	const fetchAdmins = useCallback(async () => {
		setLoadingAdmins(true);
		try {
			const res = await api.get("/admin/admins");
			setAdmins(res.data);
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to fetch admin users.");
		} finally {
			setLoadingAdmins(false);
		}
	}, []);

	const fetchPermissions = useCallback(async () => {
		setLoadingPermissions(true);
		try {
			const res = await api.get("/admin/permissions");
			setPermissions(res.data);
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to fetch permissions.");
		} finally {
			setLoadingPermissions(false);
		}
	}, []);

	useEffect(() => {
		fetchAdmins();
		fetchPermissions();
	}, [fetchAdmins, fetchPermissions]);

	// Handle adding new permission
	async function handleAddPermission(e: React.FormEvent) {
		e.preventDefault();
		if (!newPermName.trim() || !newPermPath.trim()) return;

		if (!newPermPath.startsWith("/admin")) {
			toast.error("Permission path must start with /admin");
			return;
		}

		setSubmittingPerm(true);
		try {
			const _res = await api.post("/admin/permissions", {
				name: newPermName,
				path: newPermPath,
			});
			toast.success(`Permission "${newPermName}" registered successfully!`);
			setNewPermName("");
			setNewPermPath("");
			fetchPermissions();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to add permission.");
		} finally {
			setSubmittingPerm(false);
		}
	}

	// Handle deleting permission
	function handleDeletePermission(id: string) {
		triggerConfirmation(
			"Delete Permission",
			"Are you sure you want to delete this permission? It will be revoked from all admins.",
			async () => {
				try {
					await api.delete(`/admin/permissions?id=${id}`);
					toast.success("Permission deleted successfully.");
					fetchPermissions();
					fetchAdmins();
				} catch (err: any) {
					toast.error(
						err.response?.data?.error || "Failed to delete permission.",
					);
				}
			},
		);
	}

	// Handle deleting admin user
	function handleDeleteAdmin(id: string, name: string) {
		triggerConfirmation(
			"Delete Admin User",
			`Are you sure you want to delete admin user "${name}"? This action cannot be undone.`,
			async () => {
				try {
					await api.delete(`/admin/admins?id=${id}`);
					toast.success(`Admin user "${name}" deleted successfully.`);
					fetchAdmins();
				} catch (err: any) {
					toast.error(
						err.response?.data?.error || "Failed to delete admin user.",
					);
				}
			},
		);
	}

	// Open edit permissions modal
	function openEditModal(admin: Admin) {
		setEditingAdmin(admin);
		setSelectedPermissions([...admin.permissions]);
	}

	// Toggle permission check in modal
	function togglePermission(path: string) {
		setSelectedPermissions((prev) =>
			prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
		);
	}

	// Save admin permissions
	async function handleSavePermissions() {
		if (!editingAdmin) return;

		setUpdatingAdmin(true);
		try {
			await api.put("/admin/admins", {
				id: editingAdmin.id,
				permissions: selectedPermissions,
			});
			toast.success(`Permissions for ${editingAdmin.fullName} updated!`);
			setEditingAdmin(null);
			fetchAdmins();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to update permissions.");
		} finally {
			setUpdatingAdmin(false);
		}
	}

	return (
		<div className="space-y-6 max-w-6xl">
			{/* Header */}
			<div className="flex items-end justify-between border-b border-black/8 pb-4">
				<div>
					<p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-black/30 mb-1">
						System Control
					</p>
					<h1 className="font-heading text-2xl font-black uppercase tracking-tight text-[#0A0A0A] md:text-3xl">
						ADMIN MANAGEMENT
					</h1>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-black/8">
				<button
					type="button"
					onClick={() => setActiveTab("admins")}
					className={`flex items-center gap-2 px-5 py-3 font-heading text-sm font-black uppercase tracking-[0.06em] border-b-2 transition-all ${
						activeTab === "admins"
							? "border-[var(--color-accent)] text-[var(--color-accent)]"
							: "border-transparent text-black/40 hover:text-black hover:border-black/10"
					}`}
				>
					<Users className="h-4 w-4" />
					Admin Users
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("permissions")}
					className={`flex items-center gap-2 px-5 py-3 font-heading text-sm font-black uppercase tracking-[0.06em] border-b-2 transition-all ${
						activeTab === "permissions"
							? "border-[var(--color-accent)] text-[var(--color-accent)]"
							: "border-transparent text-black/40 hover:text-black hover:border-black/10"
					}`}
				>
					<Key className="h-4 w-4" />
					Page Permissions
				</button>
			</div>

			{/* Tab Contents */}
			<div className="py-4">
				{activeTab === "admins" && (
					<div className="bg-white border border-black/8">
						<div className="p-4 border-b border-black/8 bg-black/[0.01] flex justify-between items-center">
							<h2 className="font-heading text-sm font-black uppercase tracking-[0.06em] text-black/70">
								Registered Admin accounts
							</h2>
							<button
								type="button"
								onClick={fetchAdmins}
								className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-accent)] hover:underline"
							>
								Refresh List
							</button>
						</div>

						{loadingAdmins ? (
							<div className="flex justify-center items-center py-20">
								<Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
							</div>
						) : admins.length === 0 ? (
							<div className="text-center py-16 text-black/40 font-mono text-xs uppercase">
								No admin accounts found.
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse text-xs">
									<thead>
										<tr className="border-b border-black/8 bg-black/[0.02] font-mono text-black/50 uppercase tracking-wider">
											<th className="p-4 font-semibold">Name</th>
											<th className="p-4 font-semibold">Email</th>
											<th className="p-4 font-semibold">
												Assigned Permissions
											</th>
											<th className="p-4 font-semibold text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-black/6 font-sans">
										{admins.map((admin) => {
											const isSuper = admin.permissions.includes("*");
											return (
												<tr key={admin.id} className="hover:bg-black/[0.01]">
													<td className="p-4 font-bold text-black flex items-center gap-2">
														{admin.fullName}
														{isSuper && (
															<span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider border border-amber-500/20">
																<ShieldCheck className="h-3 w-3" />
																Super
															</span>
														)}
													</td>
													<td className="p-4 text-black/60">{admin.email}</td>
													<td className="p-4">
														{isSuper ? (
															<span className="text-amber-600 font-semibold font-mono">
																ALL PAGES (WILDCARD)
															</span>
														) : admin.permissions.length === 0 ? (
															<span className="text-red-500 font-mono text-[0.65rem] uppercase tracking-wide">
																None (Awaiting activation)
															</span>
														) : (
															<div className="flex flex-wrap gap-1">
																{admin.permissions.map((p) => {
																	// Look up permission name
																	const permObj = permissions.find(
																		(pm) => pm.path === p,
																	);
																	return (
																		<span
																			key={p}
																			className="bg-black/5 text-black/70 px-2 py-0.5 rounded font-mono text-[0.65rem] border border-black/5"
																		>
																			{permObj ? permObj.name : p}
																		</span>
																	);
																})}
															</div>
														)}
													</td>
													<td className="p-4 text-right">
														{admin.permissions.includes("*") ? (
															<span className="text-black/30 text-[0.62rem] uppercase font-mono">
																Locked
															</span>
														) : (
															<div className="flex items-center justify-end gap-2">
																<button
																	type="button"
																	onClick={() => openEditModal(admin)}
																	className="inline-flex items-center gap-1.5 bg-black hover:bg-[var(--color-accent)] hover:text-white px-3 py-1.5 text-[0.65rem] font-bold uppercase text-white transition-colors"
																>
																	<Edit2 className="h-3 w-3" />
																	Edit
																</button>
																<button
																	type="button"
																	onClick={() =>
																		handleDeleteAdmin(admin.id, admin.fullName)
																	}
																	className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-[0.65rem] font-bold uppercase transition-colors"
																>
																	<Trash2 className="h-3 w-3" />
																	Delete
																</button>
															</div>
														)}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				{activeTab === "permissions" && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Registered Permissions List */}
						<div className="bg-white border border-black/8 md:col-span-2">
							<div className="p-4 border-b border-black/8 bg-black/[0.01]">
								<h2 className="font-heading text-sm font-black uppercase tracking-[0.06em] text-black/70">
									Registered Page permissions
								</h2>
							</div>

							{loadingPermissions ? (
								<div className="flex justify-center items-center py-16">
									<Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
								</div>
							) : permissions.length === 0 ? (
								<div className="text-center py-12 text-black/40 font-mono text-xs uppercase">
									No permissions registered yet.
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left border-collapse text-xs">
										<thead>
											<tr className="border-b border-black/8 bg-black/[0.02] font-mono text-black/50 uppercase tracking-wider">
												<th className="p-4 font-semibold">Permission Name</th>
												<th className="p-4 font-semibold">Required Path</th>
												<th className="p-4 font-semibold text-right">Action</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-black/6 font-sans">
											{permissions.map((perm) => (
												<tr key={perm.id} className="hover:bg-black/[0.01]">
													<td className="p-4 font-bold text-black">
														{perm.name}
													</td>
													<td className="p-4 font-mono text-black/60">
														{perm.path}
													</td>
													<td className="p-4 text-right">
														{perm.path === "/admin/admins" ? (
															<span className="text-black/30 text-[0.62rem] uppercase font-mono mr-2">
																Protected
															</span>
														) : (
															<button
																type="button"
																onClick={() => handleDeletePermission(perm.id)}
																className="text-red-500 hover:text-red-700 p-1.5 transition-colors"
																title="Delete Permission"
															>
																<Trash2 className="h-4 w-4" />
															</button>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>

						{/* Register New Permission Form */}
						<div className="bg-white border border-black/8 p-6 self-start space-y-4">
							<h3 className="font-heading text-base font-black uppercase tracking-[0.06em] text-black border-b border-black/8 pb-3">
								Register Permission
							</h3>

							<form
								onSubmit={handleAddPermission}
								className="space-y-4 text-xs"
							>
								<div className="space-y-1">
									<label
										htmlFor="PermissionNameMessages"
										className="font-mono font-bold text-black/60 uppercase tracking-wide block"
									>
										Permission Name (e.g. Messages)
									</label>
									<input
										id="PermissionNameMessages"
										type="text"
										required
										placeholder="e.g. Products & Services"
										value={newPermName}
										onChange={(e) => setNewPermName(e.target.value)}
										disabled={submittingPerm}
										className="w-full border border-black/10 bg-black/[0.02] px-3.5 py-2.5 text-black placeholder:text-black/30 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
									/>
								</div>

								<div className="space-y-1">
									<label
										htmlFor="RequiredPathStartsWithAdmin"
										className="font-mono font-bold text-black/60 uppercase tracking-wide block"
									>
										Required Path (starts with /admin)
									</label>
									<input
										id="RequiredPathStartsWithAdmin"
										type="text"
										required
										placeholder="e.g. /admin/products"
										value={newPermPath}
										onChange={(e) => setNewPermPath(e.target.value)}
										disabled={submittingPerm}
										className="w-full border border-black/10 bg-black/[0.02] px-3.5 py-2.5 font-mono text-black placeholder:text-black/30 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
									/>
								</div>

								<button
									type="submit"
									disabled={submittingPerm || !newPermName || !newPermPath}
									className="w-full bg-black py-3 font-heading font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[var(--color-accent)] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
								>
									{submittingPerm ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Registering...
										</>
									) : (
										<>
											<Plus className="h-4 w-4" />
											Register page
										</>
									)}
								</button>
							</form>
						</div>
					</div>
				)}
			</div>

			{/* Edit Permissions Modal */}
			{editingAdmin && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
					<div className="bg-white border border-black/8 w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
						{/* Modal Header */}
						<div className="flex justify-between items-center p-5 border-b border-black/8 bg-black/[0.01]">
							<div>
								<h3 className="font-heading text-base font-black uppercase tracking-[0.06em] text-black">
									Edit Admin Permissions
								</h3>
								<p className="font-mono text-[0.62rem] text-black/40 mt-1">
									Configuring {editingAdmin.fullName} ({editingAdmin.email})
								</p>
							</div>
							<button
								type="button"
								onClick={() => setEditingAdmin(null)}
								className="text-black/40 hover:text-black transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Modal Body */}
						<div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
							<div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 p-3.5 text-xs text-amber-800 rounded">
								<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
								<p className="leading-relaxed">
									Admins with no permissions assigned will not be authenticated
									upon login attempt. Check the allowed admin pages below.
								</p>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="AssignPagePermissions"
									className="font-mono text-[0.65rem] font-bold uppercase tracking-wider text-black/50 block mb-3"
								>
									Assign page permissions
								</label>

								{permissions.length === 0 ? (
									<p className="text-xs text-black/40 italic">
										No permissions registered. Register permissions in the
										&quot;Page Permissions&quot; tab first.
									</p>
								) : (
									<div className="grid grid-cols-1 gap-2.5">
										{permissions.map((perm) => {
											const isChecked = selectedPermissions.includes(perm.path);
											return (
												<button
													key={perm.id}
													type="button"
													onClick={() => togglePermission(perm.path)}
													className={`flex items-center justify-between p-3.5 border text-left transition-all ${
														isChecked
															? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-black"
															: "border-black/8 hover:bg-black/[0.02] text-black/60"
													}`}
												>
													<div className="text-xs">
														<p className="font-bold text-black">{perm.name}</p>
														<p className="font-mono text-[0.65rem] text-black/40 mt-0.5">
															{perm.path}
														</p>
													</div>
													<div
														className={`h-5 w-5 flex items-center justify-center border transition-all ${
															isChecked
																? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
																: "border-black/20 text-transparent"
														}`}
													>
														<Check className="h-3 w-3 stroke-[3]" />
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>
						</div>

						{/* Modal Footer */}
						<div className="flex justify-end gap-3 p-5 border-t border-black/8 bg-black/[0.01]">
							<button
								type="button"
								onClick={() => setEditingAdmin(null)}
								disabled={updatingAdmin}
								className="px-5 py-2.5 border border-black/8 font-heading text-xs font-black uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-black transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleSavePermissions}
								disabled={updatingAdmin}
								className="bg-black hover:bg-[var(--color-accent)] text-white px-5 py-2.5 font-heading text-xs font-black uppercase tracking-[0.06em] transition-colors flex items-center gap-1.5 cursor-pointer"
							>
								{updatingAdmin ? (
									<>
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Shield className="h-3.5 w-3.5" />
										Save permissions
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			<AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
				{alertDialogConfig && (
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{alertDialogConfig.title}</AlertDialogTitle>
							<AlertDialogDescription>
								{alertDialogConfig.description}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={alertDialogConfig.action}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								Confirm
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				)}
			</AlertDialog>
		</div>
	);
}
