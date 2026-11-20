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

interface ContactDetail {
	id: string;
	platform: string;
	label: string;
	value: string;
	url: string;
	order: number;
}

export default function ContactDetailsTab() {
	const [contacts, setContacts] = useState<ContactDetail[]>([]);
	const [loadingContacts, setLoadingContacts] = useState(true);
	const [savingContact, setSavingContact] = useState(false);
	const [contactOpen, setContactOpen] = useState(false);
	const [editingContact, setEditingContact] = useState<ContactDetail | null>(
		null,
	);
	const [contactForm, setContactForm] = useState({
		platform: "",
		label: "",
		value: "",
		url: "",
		order: 0,
	});

	useEffect(() => {
		async function loadContacts() {
			setLoadingContacts(true);
			try {
				const r = await api.get("/admin/contacts");
				setContacts(r.data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoadingContacts(false);
			}
		}

		loadContacts();
	}, []);

	function openCreateContact() {
		setEditingContact(null);
		setContactForm({
			platform: "",
			label: "",
			value: "",
			url: "",
			order: contacts.length + 1,
		});
		setContactOpen(true);
	}

	function openEditContact(c: ContactDetail) {
		setEditingContact(c);
		setContactForm({
			platform: c.platform,
			label: c.label,
			value: c.value,
			url: c.url,
			order: c.order,
		});
		setContactOpen(true);
	}

	async function handleDeleteContact(id: string) {
		try {
			await api.delete(`/admin/contacts/${id}`);
			setContacts((prev) => prev.filter((c) => c.id !== id));
			toast.success("Contact detail deleted.");
		} catch (err: any) {
			console.error(err);
			toast.error(err.response?.data?.error || "Failed to delete contact.");
		}
	}

	async function handleContactSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSavingContact(true);
		const payload = { ...contactForm, order: Number(contactForm.order) };
		try {
			const url = editingContact
				? `/admin/contacts/${editingContact.id}`
				: "/admin/contacts";
			const res = editingContact
				? await api.patch(url, payload)
				: await api.post(url, payload);
			const saved = res.data;
			if (res.status === 200 || res.status === 201) {
				setContacts((prev) =>
					editingContact
						? prev.map((c) => (c.id === saved.id ? saved : c))
						: [...prev, saved],
				);
				setContactOpen(false);
				toast.success("Contact detail saved.");
			}
		} catch {
			toast.error("Failed to save contact detail.");
		} finally {
			setSavingContact(false);
		}
	}

	return (
		<>
			<TabsContent value="contacts">
				<div className="flex justify-between items-center mb-4">
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
						Manage contact details rendered on the contact page
					</p>
					<Button
						onClick={openCreateContact}
						size="sm"
						className="rounded-none bg-black text-white hover:bg-[var(--color-accent)] hover:text-white font-semibold text-xs uppercase tracking-wider cursor-pointer"
					>
						<Plus className="mr-1 h-3.5 w-3.5" /> Add Contact Option
					</Button>
				</div>

				{loadingContacts ? (
					<div className="py-16 text-center text-sm text-black/35 font-['JetBrains_Mono']">
						Loading contact details...
					</div>
				) : contacts.length === 0 ? (
					<div className="py-16 text-center text-sm text-black/25 font-['JetBrains_Mono']">
						No contact details found. Add one above.
					</div>
				) : (
					<Table className="bg-white border border-black/8 w-full min-w-0">
						<TableHeader className="bg-black/5">
							<TableRow>
								<TableHead className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
									Platform/Icon
								</TableHead>
								<TableHead className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
									Label
								</TableHead>
								<TableHead className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
									Value
								</TableHead>
								<TableHead className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
									URL
								</TableHead>
								<TableHead className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
									Order
								</TableHead>
								<TableHead className="text-right font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{contacts.map((c) => (
								<TableRow key={c.id}>
									<TableCell className="font-['JetBrains_Mono'] text-xs font-bold uppercase">
										{c.platform}
									</TableCell>
									<TableCell className="text-sm font-semibold">
										{c.label}
									</TableCell>
									<TableCell className="text-sm font-medium text-black/60">
										{c.value}
									</TableCell>
									<TableCell className="text-xs text-black/40 font-mono truncate max-w-[180px]">
										{c.url}
									</TableCell>
									<TableCell className="font-['JetBrains_Mono'] text-xs text-black/30">
										#{c.order}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1.5">
											<Button
												variant="outline"
												size="sm"
												onClick={() => openEditContact(c)}
												className="rounded-none border-black/10 h-7 text-xs px-2 hover:border-[#0A0A0A] gap-1"
											>
												<Edit2 className="h-3 w-3" /> Edit
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
															Delete Contact Option
														</AlertDialogTitle>
														<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
															This action cannot be undone. The contact option
															&quot;{c.label}&quot; will be permanently removed.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter className="px-6 py-4">
														<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
															Cancel
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeleteContact(c.id)}
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
			</TabsContent>

			{/* Contact Details Dialog */}
			<Dialog open={contactOpen} onOpenChange={setContactOpen}>
				<DialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
					<DialogHeader className="border-b border-black/8 px-6 py-4">
						<DialogTitle className="font-['Playfair_Display'] text-sm font-black uppercase text-[#0A0A0A]">
							{editingContact ? "Edit Contact Option" : "New Contact Option"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={handleContactSubmit}
						className="space-y-4 p-6 w-full min-w-0"
					>
						<div>
							<label
								htmlFor="contact-platform"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Platform/Icon (e.g. mail, phone, linkedin) *
							</label>
							<Input
								id="contact-platform"
								required
								value={contactForm.platform}
								onChange={(e) =>
									setContactForm({ ...contactForm, platform: e.target.value })
								}
								placeholder="e.g. mail, phone, linkedin"
								className="rounded-none text-sm text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="contact-label"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Label *
							</label>
							<Input
								id="contact-label"
								required
								value={contactForm.label}
								onChange={(e) =>
									setContactForm({ ...contactForm, label: e.target.value })
								}
								placeholder="e.g. BY EMAIL"
								className="rounded-none text-sm text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="contact-value"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Value *
							</label>
							<Input
								id="contact-value"
								required
								value={contactForm.value}
								onChange={(e) =>
									setContactForm({ ...contactForm, value: e.target.value })
								}
								placeholder="e.g. info@dabel.ng"
								className="rounded-none text-sm text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="contact-url"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								URL *
							</label>
							<Input
								id="contact-url"
								required
								value={contactForm.url}
								onChange={(e) =>
									setContactForm({ ...contactForm, url: e.target.value })
								}
								placeholder="e.g. mailto:info@dabel.ng"
								className="rounded-none text-sm text-[#0A0A0A]"
							/>
						</div>
						<div>
							<label
								htmlFor="contact-order"
								className="mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40"
							>
								Display Order
							</label>
							<Input
								id="contact-order"
								type="number"
								value={contactForm.order}
								onChange={(e) =>
									setContactForm({
										...contactForm,
										order: Number(e.target.value),
									})
								}
								className="rounded-none text-[#0A0A0A]"
							/>
						</div>
						<DialogFooter className="pt-4 border-t border-black/5">
							<Button
								type="button"
								variant="outline"
								onClick={() => setContactOpen(false)}
								className="rounded-none h-10 border-black/10"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={savingContact}
								className="rounded-none bg-[#0A0A0A] text-white hover:bg-[var(--color-accent)] hover:text-white cursor-pointer"
							>
								{savingContact ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Save Contact
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
