"use client";

import { BookOpen, Mail, Rss, Tag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BlogPostsTab from "@/components/admin/blog/BlogPostsTab";
import CategoriesTab from "@/components/admin/blog/CategoriesTab";
import NewsletterTab from "@/components/admin/blog/NewsletterTab";
import SubscribersTab from "@/components/admin/blog/SubscribersTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

interface Category {
	id: string;
	name: string;
	_count?: {
		posts: number;
	};
}

interface BlogPost {
	id: string;
	title: string;
	content: string;
	imageUrl: string | null;
	categoryId: string;
	published: boolean;
	authorName: string;
	readTime: string;
	createdAt: string;
	category?: Category;
}

interface Subscriber {
	id: string;
	email: string;
	createdAt: string;
}

export default function BlogAndNewsletterPage() {
	const searchParams = useSearchParams();
	const tabQuery = searchParams?.get("tab");
	const [activeTab, setActiveTab] = useState(tabQuery || "posts");

	useEffect(() => {
		if (tabQuery) {
			setActiveTab(tabQuery);
		}
	}, [tabQuery]);

	// Global Data States
	const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
	const [newsletterCategory, setNewsletterCategory] = useState<Category | null>(
		null,
	);

	const [loading, setLoading] = useState(true);
	const [loadingSubscribers, setLoadingSubscribers] = useState(false);

	useEffect(() => {
		async function loadData() {
			setLoading(true);
			try {
				const [postsRes, catsRes, subsRes] = await Promise.all([
					api.get("/admin/blog"),
					api.get("/admin/blog-categories"),
					api.get("/admin/newsletter"),
				]);

				const catsData = catsRes.data as Category[];

				// Bootstrap "Newsletter" category if not exists
				let nCat = catsData.find((c) => c.name.toLowerCase() === "newsletter");
				if (!nCat) {
					const createRes = await api.post("/admin/blog-categories", {
						name: "Newsletter",
					});
					nCat = createRes.data as Category;
					if (nCat) {
						catsData.push(nCat);
					}
					toast.success("Created 'Newsletter' blog category.");
				}

				setCategories(catsData);
				setNewsletterCategory(nCat || null);

				setAllPosts(postsRes.data);
				setSubscribers(subsRes.data);
			} catch (err) {
				console.error("Failed to load data", err);
				const apiErr = err as { response?: { data?: { error?: string } } };
				toast.error(
					apiErr.response?.data?.error || "Failed to load portal data.",
				);
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, []);

	async function refreshSubscribers() {
		setLoadingSubscribers(true);
		try {
			const res = await api.get("/admin/newsletter");
			setSubscribers(res.data);
		} catch (err) {
			const apiErr = err as { response?: { data?: { error?: string } } };
			toast.error(
				apiErr.response?.data?.error || "Failed to refresh subscribers.",
			);
		} finally {
			setLoadingSubscribers(false);
		}
	}

	const standardCategories = categories.filter(
		(c) => c.name.toLowerCase() !== "newsletter",
	);

	return (
		<div className="max-w-6xl space-y-6">
			{/* Header */}
			<div>
				<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.28em] text-black/30 mb-1">
					PUBLICATIONS
				</p>
				<h1 className="font-['Playfair_Display'] text-2xl font-black uppercase tracking-tight text-[#0A0A0A] md:text-3xl">
					Blog &amp; Newsletter
				</h1>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="mb-4 bg-black/5 p-1 rounded-none border border-black/8">
					<TabsTrigger
						value="posts"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<BookOpen className="h-3.5 w-3.5" /> Blog Posts
					</TabsTrigger>
					<TabsTrigger
						value="newsletter"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<Rss className="h-3.5 w-3.5" /> Newsletter
					</TabsTrigger>
					<TabsTrigger
						value="subscribers"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<Mail className="h-3.5 w-3.5" /> Mailing List
					</TabsTrigger>
					<TabsTrigger
						value="categories"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<Tag className="h-3.5 w-3.5" /> Categories
					</TabsTrigger>
				</TabsList>

				<BlogPostsTab
					allPosts={allPosts}
					setAllPosts={setAllPosts}
					categories={categories}
					standardCategories={standardCategories}
					loading={loading}
					newsletterCategory={newsletterCategory}
				/>

				<NewsletterTab
					allPosts={allPosts}
					setAllPosts={setAllPosts}
					newsletterCategory={newsletterCategory}
					loading={loading}
				/>

				<SubscribersTab
					subscribers={subscribers}
					setSubscribers={setSubscribers}
					loadingSubscribers={loadingSubscribers}
					refreshSubscribers={refreshSubscribers}
					loading={loading}
				/>

				<CategoriesTab
					categories={categories}
					setCategories={setCategories}
					loading={loading}
				/>
			</Tabs>
		</div>
	);
}
