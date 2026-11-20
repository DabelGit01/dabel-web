"use client";

import { Check, Mail, Trash2 } from "lucide-react";
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

interface Props {
	messages: Message[];
	selected: Message | null;
	loading: boolean;
	onSelect: (m: Message) => void;
	onMarkRead: (id: string) => void;
	onDelete: (id: string) => void;
}

export default function InboxList({
	messages,
	selected,
	loading,
	onSelect,
	onMarkRead,
	onDelete,
}: Props) {
	return (
		<div className="border border-black/8 bg-white">
			{loading ? (
				<div className="flex items-center justify-center py-16 text-sm text-black/35">
					Loading...
				</div>
			) : messages.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<Mail className="mb-3 h-8 w-8 text-black/15" />
					<p className="text-sm font-semibold text-black/40">
						No messages found
					</p>
				</div>
			) : (
				messages.map((msg) => (
					<div
						role="button"
						tabIndex={0}
						key={msg.id}
						onClick={() => onSelect(msg)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onSelect(msg);
							}
						}}
						aria-label={`Select message from ${msg.name}`}
						className={`flex cursor-pointer items-start gap-3 border-b border-black/5 px-4 py-4 last:border-0 hover:bg-black/[0.02] transition-colors text-left w-full outline-none focus-visible:bg-black/[0.04] ${
							selected?.id === msg.id
								? "bg-[var(--color-accent)]/10 border-l-2 border-l-[var(--color-accent)]"
								: ""
						}`}
					>
						<div
							className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${msg.read ? "bg-black/10" : "bg-[var(--color-accent)]"}`}
						/>
						<div className="min-w-0 flex-1">
							<div className="flex items-center justify-between gap-2">
								<p
									className={`truncate text-sm ${msg.read ? "font-medium text-black/60" : "font-bold text-[#0A0A0A]"}`}
								>
									{msg.name}
								</p>
								<p className="shrink-0 font-['JetBrains_Mono'] text-[0.55rem] text-black/30">
									{new Date(msg.createdAt).toLocaleDateString()}
								</p>
							</div>
							<p className="truncate text-xs text-black/50">{msg.subject}</p>
							{msg.company && (
								<p className="truncate text-xs text-black/30">{msg.company}</p>
							)}
						</div>
						<div role="presentation" className="flex shrink-0 gap-1">
							{!msg.read && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onMarkRead(msg.id);
									}}
									className="p-1.5 text-black/30 hover:bg-black/5 hover:text-black transition-colors"
									title="Mark read"
								>
									<Check className="h-3.5 w-3.5" />
								</button>
							)}
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
										}}
										className="p-1.5 text-black/30 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
										title="Delete"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</button>
								</AlertDialogTrigger>
								<AlertDialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
									<AlertDialogHeader className="border-b border-black/8 px-6 py-4">
										<AlertDialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-[#0A0A0A]">
											Delete Message
										</AlertDialogTitle>
										<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
											This action cannot be undone. The message from &quot;
											{msg.name}&quot; will be permanently removed.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter className="px-6 py-4">
										<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => onDelete(msg.id)}
											className="rounded-none bg-red-600 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-red-700"
										>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				))
			)}
		</div>
	);
}
