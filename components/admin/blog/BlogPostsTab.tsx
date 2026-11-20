"use client";

import {
	BookOpen,
	Edit2,
	Eye,
	EyeOff,
	ImagePlus,
	Loader2,
	Plus,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
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
import { storageClient as supabase } from "@/lib/storage-client";

interface Category {
	id: string;
	name: string;
	_count?: { posts: number };
}

interface BlogPost {
	id: string;
	title: string;
	content: string;
	imageUrl: string | null;
	galleryUrls?: string[] | null;
	gallery?: { url: string; title: string }[] | null;
	categoryId: string;
	published: boolean;
	authorName: string;
	readTime: string;
	createdAt: string;
	category?: Category;
}

interface Props {
	allPosts: BlogPost[];
	setAllPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
	categories: Category[];
	standardCategories: Category[];
	loading: boolean;
	newsletterCategory: Category | null;
}

const emptyForm = {
	title: "",
	content: "",
	imageUrl: "",
	galleryUrls: [] as string[],
	gallery: [] as { url: string; title: string }[],
	categoryId: "",
	published: true,
	authorName: "Dabel Team",
	readTime: "5 min read",
};

export default function BlogPostsTab({
	allPosts,
	setAllPosts,
	standardCategories,
	loading,
}: Props) {
	const filteredBlogPosts = allPosts.filter((p) =>
		standardCategories.some((c) => c.id === p.categoryId),
	);

	const [postsOpen, setPostsOpen] = useState(false);
	const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
	const [postForm, setPostForm] = useState(emptyForm);
	const [uploadingPost, setUploadingPost] = useState(false);
	const [postDragOver, setPostDragOver] = useState(false);
	const [postUploadErr, setPostUploadErr] = useState("");
	const [savingPost, setSavingPost] = useState(false);
	const postFileRef = useRef<HTMLInputElement>(null);

	function openCreatePost() {
		setEditingPost(null);
		setPostForm({ ...emptyForm, categoryId: standardCategories[0]?.id || "" });
		setPostUploadErr("");
		setPostsOpen(true);
	}

	function openEditPost(post: BlogPost) {
		setEditingPost(post);
		setPostForm({
			title: post.title,
			content: post.content,
			imageUrl: post.imageUrl ?? "",
			galleryUrls: post.galleryUrls ?? [],
			gallery: post.gallery ?? [],
			categoryId: post.categoryId,
			published: post.published,
			authorName: post.authorName,
			readTime: post.readTime,
		});
		setPostUploadErr("");
		setPostsOpen(true);
	}

	async function handleDeletePost(id: string) {
		try {
			await api.delete(`/admin/blog/${id}`);
			setAllPosts((prev) => prev.filter((p) => p.id !== id));
			toast.success("Deleted blog post.");
		} catch (err: any) {
			console.error(err);
			toast.error(err.response?.data?.error || "Failed to delete post.");
		}
	}

	async function togglePublishPost(post: BlogPost) {
		try {
			const res = await fetch(`/api/admin/blog/${post.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ published: !post.published }),
			});
			if (res.ok) {
				const updated = await res.json();
				setAllPosts((prev) =>
					prev.map((p) => (p.id === post.id ? updated : p)),
				);
				toast.success(
					updated.published ? "Post published." : "Post draft saved.",
				);
			}
		} catch (err) {
			console.error(err);
			toast.error("Failed to update post publication state.");
		}
	}

	async function uploadMainImage(file: File) {
		if (!supabase) return;
		setUploadingPost(true);
		setPostUploadErr("");
		try {
			const ext = file.name.split(".").pop();
			const path = `blog-main/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
			const { error } = await supabase.storage
				.from("dabel-media")
				.upload(path, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type,
				});
			if (error) throw error;
			const { data } = supabase.storage.from("dabel-media").getPublicUrl(path);
			setPostForm((f) => ({ ...f, imageUrl: data.publicUrl }));
			toast.success("Image uploaded successfully.");
		} catch (err) {
			console.error(err);
			setPostUploadErr("Upload failed. Ensure the storage bucket exists.");
		} finally {
			setUploadingPost(false);
		}
	}

	async function handlePostSubmit(e: FormEvent) {
		e.preventDefault();
		if (uploadingPost) return;
		setSavingPost(true);
		const payload = {
			title: postForm.title.trim(),
			content: postForm.content.trim(),
			imageUrl: postForm.imageUrl.trim() || null,
			galleryUrls: postForm.galleryUrls,
			gallery: postForm.gallery,
			categoryId: postForm.categoryId,
			published: postForm.published,
			authorName: postForm.authorName.trim() || "Dabel Team",
			readTime: postForm.readTime.trim() || "5 min read",
		};
		try {
			const url = editingPost ? `/admin/blog/${editingPost.id}` : "/admin/blog";
			const _method = editingPost ? "PATCH" : "POST";
			const res = editingPost
				? await api.patch(url, payload)
				: await api.post(url, payload);
			const data = res.data;
			if (editingPost) {
				setAllPosts((prev) =>
					prev.map((x) => (x.id === editingPost.id ? data : x)),
				);
				toast.success("Blog post updated.");
			} else {
				setAllPosts((prev) => [data, ...prev]);
				toast.success("Blog post created.");
			}
			setPostsOpen(false);
		} catch (err) {
			console.error(err);
			toast.error("Failed to save blog post");
		} finally {
			setSavingPost(false);
		}
	}

	return (
		<>
			<TabsContent value="posts">
				<div className="flex justify-between items-center mb-4">
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
						Manage published articles &amp; insights
					</p>
					<button
						type="button"
						onClick={openCreatePost}
						disabled={standardCategories.length === 0}
						className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-[var(--color-accent)] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md rounded"
					>
						<Plus className="h-4 w-4" /> Create Post
					</button>
				</div>

				{standardCategories.length === 0 && !loading && (
					<div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded text-sm mb-4">
						Please create at least one <strong>Blog Category</strong> before
						creating blog posts.
					</div>
				)}

				{loading ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-96 bg-white border border-black/5 animate-pulse rounded"
							/>
						))}
					</div>
				) : filteredBlogPosts.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-12 bg-white border border-black/5 text-center">
						<BookOpen className="h-10 w-10 text-black/20 mb-3" />
						<p className="font-bold text-[#0A0A0A]">No blog posts found</p>
						<p className="text-xs text-black/40 mt-1">
							Click the button above to create your first article
						</p>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredBlogPosts.map((post) => (
							<div
								key={post.id}
								className="bg-white border border-black/8 rounded overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all"
							>
								<div>
									<div className="relative aspect-[16/9] w-full bg-slate-100 border-b border-black/5">
										{post.imageUrl ? (
											<img
												src={post.imageUrl}
												alt={post.title}
												className="object-cover h-full w-full"
											/>
										) : (
											<div className="h-full w-full flex items-center justify-center text-black/25">
												<ImagePlus className="h-8 w-8" />
											</div>
										)}
										{post.category && (
											<span className="absolute top-3 left-3 bg-[#0A0A0A] text-white text-[0.62rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
												{post.category.name}
											</span>
										)}
									</div>
									<div className="p-6 space-y-3">
										<h3 className="font-bold text-lg text-[#0A0A0A] line-clamp-2 leading-snug font-['Playfair_Display']">
											{post.title}
										</h3>
										<p className="text-[0.68rem] text-black/40 font-mono">
											By {post.authorName} &bull; {post.readTime}
										</p>
										<p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
											{post.content}
										</p>
									</div>
								</div>
								<div className="px-6 pb-6 pt-4 border-t border-black/5 flex items-center justify-between">
									<button
										type="button"
										onClick={() => togglePublishPost(post)}
										className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors ${
											post.published
												? "bg-green-50 text-green-700 hover:bg-green-100"
												: "bg-gray-100 text-gray-500 hover:bg-gray-200"
										}`}
									>
										{post.published ? (
											<>
												<Eye className="h-3.5 w-3.5" /> Published
											</>
										) : (
											<>
												<EyeOff className="h-3.5 w-3.5" /> Draft
											</>
										)}
									</button>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => openEditPost(post)}
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
														Delete Blog Post
													</AlertDialogTitle>
													<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
														This action cannot be undone. The blog post &quot;
														{post.title}&quot; will be permanently removed.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter className="px-6 py-4">
													<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleDeletePost(post.id)}
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
			</TabsContent>

			{/* BLOG POSTS COMPOSITION MODAL */}
			{postsOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
					<div className="bg-white border border-black/10 w-full max-w-2xl shadow-2xl rounded overflow-hidden my-8">
						<div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
							<h3 className="font-bold text-[#0A0A0A] font-['Playfair_Display']">
								{editingPost ? "Edit Blog Post" : "Compose Blog Post"}
							</h3>
							<button
								type="button"
								onClick={() => setPostsOpen(false)}
								className="text-gray-400 hover:text-black transition-colors cursor-pointer"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<form
							onSubmit={handlePostSubmit}
							className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
						>
							<div className="space-y-1">
								<label
									htmlFor="post-category"
									className="block text-xs font-bold uppercase tracking-wider text-black/50 font-['JetBrains_Mono']"
								>
									Category *
								</label>
								<select
									id="post-category"
									required
									value={postForm.categoryId}
									onChange={(e) =>
										setPostForm((f) => ({ ...f, categoryId: e.target.value }))
									}
									disabled={savingPost}
									className="w-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black focus:border-[#001a3d] outline-none rounded"
								>
									{standardCategories.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.name}
										</option>
									))}
								</select>
							</div>
							<div className="space-y-1">
								<label
									htmlFor="post-title"
									className="block text-xs font-bold uppercase tracking-wider text-black/50 font-['JetBrains_Mono']"
								>
									Title *
								</label>
								<input
									id="post-title"
									required
									type="text"
									placeholder="e.g. The AI Revolution"
									value={postForm.title}
									onChange={(e) =>
										setPostForm((f) => ({ ...f, title: e.target.value }))
									}
									disabled={savingPost}
									className="w-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-[#001a3d] outline-none rounded"
								/>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<label
										htmlFor="post-author"
										className="block text-xs font-bold uppercase tracking-wider text-black/50 font-['JetBrains_Mono']"
									>
										Author Name
									</label>
									<input
										id="post-author"
										type="text"
										value={postForm.authorName}
										onChange={(e) =>
											setPostForm((f) => ({ ...f, authorName: e.target.value }))
										}
										disabled={savingPost}
										className="w-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-[#001a3d] outline-none rounded"
									/>
								</div>
								<div className="space-y-1">
									<label
										htmlFor="post-readtime"
										className="block text-xs font-bold uppercase tracking-wider text-black/50 font-['JetBrains_Mono']"
									>
										Read Time
									</label>
									<input
										id="post-readtime"
										type="text"
										value={postForm.readTime}
										onChange={(e) =>
											setPostForm((f) => ({ ...f, readTime: e.target.value }))
										}
										disabled={savingPost}
										className="w-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-[#001a3d] outline-none rounded"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="post-image"
									className="block text-xs font-bold uppercase tracking-wider text-black/50 font-['JetBrains_Mono']"
								>
									Featured Image
								</label>
								<div
									role="button"
									tabIndex={0}
									onClick={() => postFileRef.current?.click()}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											postFileRef.current?.click();
										}
									}}
									onDragOver={(e) => {
										e.preventDefault();
										setPostDragOver(true);
									}}
									onDragLeave={() => setPostDragOver(false)}
									onDrop={(e) => {
										e.preventDefault();
										setPostDragOver(false);
										const f = e.dataTransfer.files?.[0];
										if (f) uploadMainImage(f);
									}}
									className={`border-2 border-dashed rounded p-6 flex flex-col items-center justify-center transition-all bg-white cursor-pointer ${
										postDragOver
											? "border-[#001a3d] bg-slate-50"
											: "border-black/10 hover:border-black/25"
									}`}
								>
									{postForm.imageUrl ? (
										<div className="relative w-full aspect-[21/9] rounded overflow-hidden group">
											<img
												src={postForm.imageUrl}
												alt="Preview"
												className="object-cover h-full w-full"
											/>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setPostForm((f) => ({ ...f, imageUrl: "" }));
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
										id="post-image"
										type="file"
										ref={postFileRef}
										onChange={(e) => {
											const f = e.target.files?.[0];
											if (f) uploadMainImage(f);
										}}
										accept="image/*"
										className="hidden"
									/>
								</div>
								{uploadingPost && (
									<div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-['JetBrains_Mono']">
										<Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading
										image...
									</div>
								)}
								{postUploadErr && (
									<p className="text-xs text-red-500 mt-1 font-['JetBrains_Mono']">
										{postUploadErr}
									</p>
								)}
							</div>
							<div className="space-y-3">
								<div className="flex justify-between items-center border-b border-black/5 pb-2">
									<label className="block text-xs font-bold uppercase tracking-wider text-black/50 font-['JetBrains_Mono']">
										Image Gallery (Optional)
									</label>
									<button
										type="button"
										onClick={() => {
											setPostForm((f) => ({
												...f,
												gallery: [...(f.gallery || []), { url: "", title: "" }],
											}));
										}}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-black border border-black/10 hover:border-black transition-colors"
									>
										+ Add Additional Image
									</button>
								</div>

								{postForm.gallery && postForm.gallery.length > 0 ? (
									<div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
										{postForm.gallery.map((item, idx) => (
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
																	setPostForm((f) => ({
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
																		setPostUploadErr(
																			"Storage client not initialized.",
																		);
																		return;
																	}
																	setUploadingPost(true);
																	setPostUploadErr("");
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
																		const path = `blog-gallery/${Date.now()}-${crypto.randomUUID()}-${base}.${ext}`;
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
																		setPostForm((f) => ({
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
																		setPostUploadErr(
																			"Upload failed. Please check bucket policies.",
																		);
																	} finally {
																		setUploadingPost(false);
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
															setPostForm((f) => ({
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
														setPostForm((f) => ({
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
								{postUploadErr && (
									<p className="text-xs text-red-500 font-['JetBrains_Mono'] mt-1">
										{postUploadErr}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<label
									htmlFor="post-content"
									className="block text-xs font-bold uppercase tracking-wider text-black/50 font-['JetBrains_Mono']"
								>
									Article Content *
								</label>
								<textarea
									id="post-content"
									required
									rows={8}
									placeholder="Write your article content here..."
									value={postForm.content}
									onChange={(e) =>
										setPostForm((f) => ({ ...f, content: e.target.value }))
									}
									disabled={savingPost}
									className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-[#001a3d] outline-none rounded resize-none"
								/>
							</div>
							<div className="flex items-center gap-2 pt-2">
								<input
									type="checkbox"
									id="post-published"
									checked={postForm.published}
									onChange={(e) =>
										setPostForm((f) => ({ ...f, published: e.target.checked }))
									}
									disabled={savingPost}
									className="h-4 w-4 rounded border-gray-300 text-[#0A0A0A] accent-black"
								/>
								<label
									htmlFor="post-published"
									className="text-xs font-bold uppercase tracking-wider text-black/60 select-none cursor-pointer font-['JetBrains_Mono']"
								>
									Publish article immediately (visible to the public)
								</label>
							</div>
							<div className="flex justify-end gap-3 pt-4 border-t border-black/5">
								<button
									type="button"
									onClick={() => setPostsOpen(false)}
									disabled={savingPost}
									className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-black/5 transition-colors cursor-pointer rounded"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={savingPost || uploadingPost}
									className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer rounded"
								>
									{savingPost ? "Saving..." : "Save Post"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
