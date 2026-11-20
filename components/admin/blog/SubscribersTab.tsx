"use client";

import { Download, Mail, Search, Trash2 } from "lucide-react";
import { useState } from "react";
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

interface Subscriber {
	id: string;
	email: string;
	createdAt: string;
}

interface Props {
	subscribers: Subscriber[];
	setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
	loadingSubscribers: boolean;
	refreshSubscribers: () => void;
	loading: boolean;
}

function formatDate(dateStr: string) {
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function SubscribersTab({
	subscribers,
	setSubscribers,
	loading,
}: Props) {
	const [subSearch, setSubSearch] = useState("");

	const filteredSubscribers = subscribers.filter((s) =>
		s.email.toLowerCase().includes(subSearch.toLowerCase()),
	);

	async function handleDeleteSubscriber(id: string) {
		try {
			await api.delete(`/admin/newsletter/${id}`);
			setSubscribers((prev) => prev.filter((s) => s.id !== id));
			toast.success("Subscriber removed.");
		} catch (err: any) {
			console.error(err);
			toast.error(err.response?.data?.error || "Failed to remove subscriber.");
		}
	}

	function exportCSV() {
		const rows = [
			"Email,Date",
			...subscribers.map(
				(s) => `${s.email},${new Date(s.createdAt).toLocaleDateString()}`,
			),
		];
		const blob = new Blob([rows.join("\n")], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "subscribers.csv";
		a.click();
		URL.revokeObjectURL(url);
	}

	return (
		<TabsContent value="subscribers">
			<div className="flex justify-between items-center mb-4">
				<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
					Manage email mailing list
				</p>
				<div className="flex items-center gap-2">
					<div className="bg-[#0A0A0A] px-3 py-1.5">
						<span className="font-['Playfair_Display'] text-lg font-black text-white">
							{subscribers.length}
						</span>
						<span className="ml-1.5 font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-white/70">
							subscribers
						</span>
					</div>
					<button
						type="button"
						onClick={exportCSV}
						className="flex items-center gap-2 border border-black/8 bg-white px-3 py-2 text-xs font-semibold text-black/50 hover:text-black transition-colors cursor-pointer"
					>
						<Download className="h-3.5 w-3.5" /> Export CSV
					</button>
				</div>
			</div>

			<div className="relative mb-4">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
				<input
					value={subSearch}
					onChange={(e) => setSubSearch(e.target.value)}
					placeholder="Search by email..."
					className="w-full border border-black/8 bg-white pl-9 pr-4 py-2.5 text-sm text-[#0A0A0A] placeholder:text-black/30 focus:border-[#0A0A0A] focus:outline-none"
				/>
			</div>

			<div className="border border-black/8 bg-white">
				{loading ? (
					<div className="flex items-center justify-center py-16 text-sm text-black/35">
						Loading...
					</div>
				) : filteredSubscribers.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<Mail className="mb-3 h-8 w-8 text-black/15" />
						<p className="text-sm font-semibold text-black/40">
							{subSearch ? "No matches" : "No subscribers yet"}
						</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-[1fr_auto_auto] items-center border-b border-black/5 bg-black/[0.02] px-5 py-2.5">
							<span className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35">
								Email
							</span>
							<span className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35 pr-10">
								Joined
							</span>
							<span />
						</div>
						{filteredSubscribers.map((s) => (
							<div
								key={s.id}
								className="grid grid-cols-[1fr_auto_auto] items-center border-b border-black/5 px-5 py-3 last:border-0 hover:bg-black/[0.01]"
							>
								<p className="text-sm font-medium text-[#0A0A0A]">{s.email}</p>
								<p className="pr-4 font-['JetBrains_Mono'] text-[0.6rem] text-black/35">
									{formatDate(s.createdAt)}
								</p>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<button
											type="button"
											className="p-1.5 text-black/25 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
										>
											<Trash2 className="h-3.5 w-3.5" />
										</button>
									</AlertDialogTrigger>
									<AlertDialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
										<AlertDialogHeader className="border-b border-black/8 px-6 py-4">
											<AlertDialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-[#0A0A0A]">
												Remove Subscriber
											</AlertDialogTitle>
											<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
												Are you sure you want to remove the subscriber &quot;
												{s.email}&quot;?
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter className="px-6 py-4">
											<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
												Cancel
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => handleDeleteSubscriber(s.id)}
												className="rounded-none bg-red-600 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-red-700"
											>
												Remove
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						))}
						<div className="border-t border-black/5 px-5 py-3">
							<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/30">
								{filteredSubscribers.length} of {subscribers.length} shown
							</p>
						</div>
					</>
				)}
			</div>
		</TabsContent>
	);
}
