"use client";

import { Edit2, Plus, Tag, Trash2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
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
import { TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api";

interface Category {
	id: string;
	name: string;
	_count?: { posts: number };
}

interface Props {
	categories: Category[];
	setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
	loading: boolean;
}

export default function CategoriesTab({
	categories,
	setCategories,
	loading,
}: Props) {
	const [catOpen, setCatOpen] = useState(false);
	const [editingCat, setEditingCat] = useState<Category | null>(null);
	const [catName, setCatName] = useState("");
	const [catError, setCatError] = useState("");
	const [savingCat, setSavingCat] = useState(false);

	function openCreateCat() {
		setEditingCat(null);
		setCatName("");
		setCatError("");
		setCatOpen(true);
	}

	function openEditCat(cat: Category) {
		setEditingCat(cat);
		setCatName(cat.name);
		setCatError("");
		setCatOpen(true);
	}

	async function handleDeleteCat(id: string) {
		try {
			await api.delete(`/admin/blog-categories/${id}`);
			setCategories((prev) => prev.filter((c) => c.id !== id));
			toast.success("Category deleted.");
		} catch (err: any) {
			console.error(err);
			toast.error(err.response?.data?.error || "Failed to delete category");
		}
	}

	async function handleCatSubmit(e: FormEvent) {
		e.preventDefault();
		if (!catName.trim()) return;
		setSavingCat(true);
		setCatError("");
		try {
			const url = editingCat
				? `/admin/blog-categories/${editingCat.id}`
				: "/admin/blog-categories";
			const res = editingCat
				? await api.patch(url, { name: catName.trim() })
				: await api.post(url, { name: catName.trim() });
			const data = res.data;
			if (res.status === 200 || res.status === 201) {
				if (editingCat) {
					setCategories((prev) =>
						prev.map((c) =>
							c.id === editingCat.id ? { ...c, name: data.name } : c,
						),
					);
					toast.success("Category updated.");
				} else {
					setCategories((prev) => [...prev, data]);
					toast.success("Category created.");
				}
				setCatOpen(false);
			} else {
				setCatError(data.error || "Failed to save category");
			}
		} catch (err) {
			console.error(err);
			setCatError("An unexpected error occurred");
		} finally {
			setSavingCat(false);
		}
	}

	return (
		<>
			<TabsContent value="categories">
				<div className="flex justify-between items-center mb-4">
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
						Manage filters and categories for Dabel insights articles
					</p>
					<button
						type="button"
						onClick={openCreateCat}
						className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-[var(--color-accent)] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md rounded"
					>
						<Plus className="h-4 w-4" /> Add Category
					</button>
				</div>

				{loading ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-32 bg-white border border-black/5 animate-pulse rounded"
							/>
						))}
					</div>
				) : categories.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-12 bg-white border border-black/5 text-center">
						<Tag className="h-10 w-10 text-black/20 mb-3" />
						<p className="font-bold text-[#0A0A0A]">No categories found</p>
						<p className="text-xs text-black/40 mt-1">
							Click the button above to create your first category
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{categories.map((cat) => (
							<div
								key={cat.id}
								className="bg-white border border-black/8 p-6 hover:shadow-sm transition-all flex flex-col justify-between rounded"
							>
								<div>
									<h3 className="font-bold text-lg text-[#0A0A0A] truncate">
										{cat.name}
									</h3>
									<p className="text-xs text-black/40 mt-1">
										ID: <span className="font-mono">{cat.id}</span>
									</p>
								</div>
								<div className="mt-6 flex items-center justify-end gap-2 border-t border-black/5 pt-4">
									{cat.name.toLowerCase() !== "newsletter" ? (
										<>
											<button
												type="button"
												onClick={() => openEditCat(cat)}
												className="p-2 text-gray-500 hover:text-black hover:bg-black/5 transition-colors cursor-pointer rounded"
											>
												<Edit2 className="h-4 w-4" />
											</button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<button
														type="button"
														className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer rounded"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</AlertDialogTrigger>
												<AlertDialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
													<AlertDialogHeader className="border-b border-black/8 px-6 py-4">
														<AlertDialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-[#0A0A0A]">
															Delete Category
														</AlertDialogTitle>
														<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
															This action cannot be undone. Deleting category
															&quot;{cat.name}&quot; will also delete all
															associated blog posts.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter className="px-6 py-4">
														<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
															Cancel
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeleteCat(cat.id)}
															className="rounded-none bg-red-600 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-red-700"
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</>
									) : (
										<span className="text-[0.62rem] font-bold uppercase tracking-wider text-black/30 font-['JetBrains_Mono'] px-2 py-1 bg-black/5 rounded">
											System Protected
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</TabsContent>

			{/* CATEGORIES CREATION MODAL */}
			{catOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
					<div className="bg-white border border-black/10 w-full max-w-md shadow-2xl rounded overflow-hidden">
						<div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
							<h3 className="font-bold text-[#0A0A0A]">
								{editingCat ? "Edit Category" : "Create Category"}
							</h3>
							<button
								type="button"
								onClick={() => setCatOpen(false)}
								className="text-gray-400 hover:text-black transition-colors cursor-pointer"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<form onSubmit={handleCatSubmit} className="p-6 space-y-4">
							{catError && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded">
									{catError}
								</div>
							)}
							<div className="space-y-1">
								<label
									htmlFor="category-name"
									className="block text-xs font-bold uppercase tracking-wider text-black/50 font-['JetBrains_Mono']"
								>
									Category Name *
								</label>
								<input
									id="category-name"
									required
									type="text"
									placeholder="e.g. AI & Robotics"
									value={catName}
									onChange={(e) => setCatName(e.target.value)}
									disabled={savingCat}
									className="w-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-[#001a3d] outline-none rounded"
								/>
							</div>
							<div className="flex justify-end gap-3 pt-4 border-t border-black/5">
								<button
									type="button"
									onClick={() => setCatOpen(false)}
									disabled={savingCat}
									className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-black/5 transition-colors cursor-pointer rounded"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={savingCat || !catName.trim()}
									className="px-4 py-2.5 bg-[#001a3d] hover:bg-[#002b66] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer rounded"
								>
									{savingCat ? "Saving..." : "Save"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
