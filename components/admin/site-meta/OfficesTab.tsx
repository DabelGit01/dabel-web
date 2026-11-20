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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

interface Office {
	id: string;
	name: string;
	address: string;
	email: string;
	phone: string;
	order: number;
	published: boolean;
}

export default function OfficesTab() {
	const [offices, setOffices] = useState<Office[]>([]);
	const [loadingOffices, setLoadingOffices] = useState(true);
	const [savingOffice, setSavingOffice] = useState(false);
	const [officeOpen, setOfficeOpen] = useState(false);
	const [editingOffice, setEditingOffice] = useState<Office | null>(null);
	const [officeForm, setOfficeForm] = useState({
		name: "",
		address: "",
		email: "",
		phone: "",
		order: 0,
		published: true,
	});

	useEffect(() => {
		async function loadOffices() {
			setLoadingOffices(true);
			try {
				const r = await api.get("/admin/offices");
				setOffices(r.data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoadingOffices(false);
			}
		}

		loadOffices();
	}, []);

	function openCreateOffice() {
		setEditingOffice(null);
		setOfficeForm({
			name: "",
			address: "",
			email: "",
			phone: "",
			order: offices.length + 1,
			published: true,
		});
		setOfficeOpen(true);
	}

	function openEditOffice(o: Office) {
		setEditingOffice(o);
		setOfficeForm({
			name: o.name,
			address: o.address,
			email: o.email,
			phone: o.phone,
			order: o.order,
			published: o.published,
		});
		setOfficeOpen(true);
	}

	async function handleDeleteOffice(id: string) {
		try {
			await api.delete(`/admin/offices/${id}`);
			setOffices((prev) => prev.filter((o) => o.id !== id));
			toast.success("Office deleted.");
		} catch (err: any) {
			console.error(err);
			toast.error(err.response?.data?.error || "Failed to delete office.");
		}
	}

	async function handleOfficeSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSavingOffice(true);
		const payload = { ...officeForm, order: Number(officeForm.order) };
		try {
			const url = editingOffice
				? `/admin/offices/${editingOffice.id}`
				: "/admin/offices";
			const res = editingOffice
				? await api.patch(url, payload)
				: await api.post(url, payload);
			const saved = res.data;
			if (res.status === 200 || res.status === 201) {
				setOffices((prev) =>
					editingOffice
						? prev.map((o) => (o.id === saved.id ? saved : o))
						: [...prev, saved],
				);
				setOfficeOpen(false);
				toast.success("Office saved.");
			}
		} catch {
			toast.error("Failed to save office.");
		} finally {
			setSavingOffice(false);
		}
	}

	return (
		<>
			<TabsContent value="offices">
				<div className="flex justify-between items-center mb-4">
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
						Manage regional offices &amp; operations
					</p>
					<Button
						onClick={openCreateOffice}
						size="sm"
						className="rounded-none bg-black text-white hover:bg-[var(--color-accent)] hover:text-white font-semibold text-xs uppercase tracking-wider cursor-pointer"
					>
						<Plus className="mr-1 h-3.5 w-3.5" /> Add Location
					</Button>
				</div>

				<div className="border border-black/8 bg-white">
					{loadingOffices ? (
						<div className="py-16 text-center text-sm text-black/35 font-['JetBrains_Mono']">
							Loading locations...
						</div>
					) : offices.length === 0 ? (
						<div className="py-16 text-center text-sm text-black/25 font-['JetBrains_Mono']">
							No office locations found. Add one above.
						</div>
					) : (
						<Table>
							<TableHeader className="bg-black/2">
								<TableRow>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide">
										Name / Region
									</TableHead>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide">
										Address
									</TableHead>
									<TableHead className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-wide">
										Contacts
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
								{offices.map((o) => (
									<TableRow key={o.id}>
										<TableCell className="font-semibold text-[#0A0A0A]">
											{o.name}
										</TableCell>
										<TableCell className="text-xs text-black/50 max-w-[200px] truncate">
											{o.address}
										</TableCell>
										<TableCell className="text-xs space-y-0.5">
											<p className="text-black/60 font-semibold">{o.email}</p>
											<p className="text-black/40">{o.phone}</p>
										</TableCell>
										<TableCell className="text-center">
											<span
												className={`px-2 py-0.5 font-['JetBrains_Mono'] text-[0.52rem] uppercase tracking-wide ${o.published ? "bg-[var(--color-accent)] text-white" : "border border-black/10 text-black/35"}`}
											>
												{o.published ? "Live" : "Draft"}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1.5">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openEditOffice(o)}
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
																Delete Location
															</AlertDialogTitle>
															<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
																This action cannot be undone. The office
																location &quot;{o.name}&quot; will be
																permanently removed.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter className="px-6 py-4">
															<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDeleteOffice(o.id)}
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

			{/* Office Locations Dialog */}
			<Dialog open={officeOpen} onOpenChange={setOfficeOpen}>
				<DialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
					<DialogHeader className="border-b border-black/8 px-6 py-4">
						<DialogTitle className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							{editingOffice ? "Edit Office Location" : "New Office Location"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={handleOfficeSubmit}
						className="space-y-4 p-6 w-full min-w-0"
					>
						<div>
							<label
								htmlFor="office-name"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Office / Region Name *
							</label>
							<Input
								id="office-name"
								required
								value={officeForm.name}
								onChange={(e) =>
									setOfficeForm({ ...officeForm, name: e.target.value })
								}
								placeholder="e.g. Nigeria – Lagos HQ"
								className="rounded-none text-sm text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="office-address"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Full Address *
							</label>
							<Textarea
								id="office-address"
								required
								value={officeForm.address}
								onChange={(e) =>
									setOfficeForm({ ...officeForm, address: e.target.value })
								}
								placeholder="Plot 10, Technology Way..."
								rows={3}
								className="rounded-none resize-none text-[#0A0A0A]"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="office-email"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Contact Email *
								</label>
								<Input
									id="office-email"
									required
									type="email"
									value={officeForm.email}
									onChange={(e) =>
										setOfficeForm({ ...officeForm, email: e.target.value })
									}
									placeholder="info@..."
									className="rounded-none text-[#0A0A0A]"
								/>
							</div>
							<div>
								<label
									htmlFor="office-phone"
									className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
								>
									Phone Number *
								</label>
								<Input
									id="office-phone"
									required
									value={officeForm.phone}
									onChange={(e) =>
										setOfficeForm({ ...officeForm, phone: e.target.value })
									}
									placeholder="+234..."
									className="rounded-none text-[#0A0A0A]"
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="office-order"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Display Order
							</label>
							<Input
								id="office-order"
								type="number"
								value={officeForm.order}
								onChange={(e) =>
									setOfficeForm({
										...officeForm,
										order: Number(e.target.value),
									})
								}
								className="rounded-none text-[#0A0A0A]"
							/>
						</div>
						<div className="flex items-center gap-2 pt-2">
							<input
								type="checkbox"
								id="published-office"
								checked={officeForm.published}
								onChange={(e) =>
									setOfficeForm({ ...officeForm, published: e.target.checked })
								}
								className="h-4 w-4 accent-black"
							/>
							<label
								htmlFor="published-office"
								className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/50 select-none"
							>
								Publish Immediately
							</label>
						</div>
						<DialogFooter className="pt-4 border-t border-black/5">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOfficeOpen(false)}
								className="rounded-none h-10 border-black/10"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={savingOffice}
								className="rounded-none bg-[#0A0A0A] text-white hover:bg-[var(--color-accent)] hover:text-white cursor-pointer"
							>
								{savingOffice ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Save Office
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
