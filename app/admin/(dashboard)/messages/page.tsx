"use client";

import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import InboxList from "@/components/admin/messages/InboxList";
import MessageDetail from "@/components/admin/messages/MessageDetail";

interface Message {
	id: string;
	name: string;
	email: string;
	company?: string;
	subject: string;
	message: string;
	read: boolean;
	createdAt: string;
}

import { api } from "@/lib/api";

export default function MessagesPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [selected, setSelected] = useState<Message | null>(null);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

	const fetchMessages = useCallback(async () => {
		setLoading(true);
		try {
			const res = await api.get("/admin/messages");
			setMessages(res.data);
		} catch (err) {
			console.error("Failed to fetch messages", err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchMessages();
	}, [fetchMessages]);

	async function markRead(id: string) {
		try {
			await api.patch(`/admin/messages/${id}`, { read: true });
			setMessages((prev) =>
				prev.map((m) => (m.id === id ? { ...m, read: true } : m)),
			);
			if (selected?.id === id) {
				setSelected((s) => (s ? { ...s, read: true } : s));
			}
		} catch (err) {
			console.error("Failed to mark message as read", err);
		}
	}

	async function deleteMessage(id: string) {
		try {
			await api.delete(`/admin/messages/${id}`);
			setMessages((prev) => prev.filter((m) => m.id !== id));
			if (selected?.id === id) setSelected(null);
		} catch (err) {
			console.error("Failed to delete message", err);
		}
	}

	const filtered = messages.filter((m) => {
		if (filter === "unread" && m.read) return false;
		if (filter === "read" && !m.read) return false;
		if (search) {
			const q = search.toLowerCase();
			return (
				m.name.toLowerCase().includes(q) ||
				m.email.toLowerCase().includes(q) ||
				m.subject.toLowerCase().includes(q)
			);
		}
		return true;
	});

	const unreadCount = messages.filter((m) => !m.read).length;

	return (
		<div className="max-w-6xl space-y-6">
			{/* Header */}
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.28em] text-black/30 mb-1">
						INBOX
					</p>
					<h1 className="font-['Playfair_Display'] text-2xl font-black uppercase tracking-tight text-[#0A0A0A] md:text-3xl">
						Messages
						{unreadCount > 0 && (
							<span className="ml-3 bg-[var(--color-accent)] px-2 py-0.5 font-['JetBrains_Mono'] text-sm font-bold text-white">
								{unreadCount}
							</span>
						)}
					</h1>
				</div>
				<button
					type="button"
					onClick={fetchMessages}
					className="flex items-center gap-2 border border-black/8 bg-white px-3 py-2 text-xs font-semibold text-black/50 hover:text-black transition-colors"
				>
					<RefreshCw className="h-3.5 w-3.5" /> Refresh
				</button>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 min-w-48">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search messages..."
						className="w-full border border-black/8 bg-white pl-9 pr-4 py-2 text-sm text-[#0A0A0A] placeholder:text-black/30 focus:border-[#0A0A0A] focus:outline-none"
					/>
				</div>
				<div className="flex gap-1">
					{(["all", "unread", "read"] as const).map((t) => (
						<button
							type="button"
							key={t}
							onClick={() => setFilter(t)}
							className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
								filter === t
									? "bg-[#0A0A0A] text-white"
									: "border border-black/8 bg-white text-black/55 hover:bg-black/5"
							}`}
						>
							{t}
						</button>
					))}
				</div>
			</div>

			{/* Content Grid */}
			<div className="grid gap-6 md:grid-cols-12">
				<div className={`${selected ? "md:col-span-7" : "md:col-span-12"}`}>
					<InboxList
						messages={filtered}
						selected={selected}
						loading={loading}
						onSelect={(m) => {
							setSelected(m);
							if (!m.read) markRead(m.id);
						}}
						onMarkRead={markRead}
						onDelete={deleteMessage}
					/>
				</div>
				{selected && (
					<div className="md:col-span-5">
						<MessageDetail
							message={selected}
							onClose={() => setSelected(null)}
							onDelete={deleteMessage}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
