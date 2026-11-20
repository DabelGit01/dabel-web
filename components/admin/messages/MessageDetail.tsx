"use client";

import { Eye, Trash2 } from "lucide-react";
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
	message: Message | null;
	onClose: () => void;
	onDelete: (id: string) => void;
}

export default function MessageDetail({ message, onClose, onDelete }: Props) {
	if (!message) return null;

	return (
		<div className="border border-black/8 bg-white p-6 space-y-5">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h2 className="font-['Playfair_Display'] text-lg font-black text-[#0A0A0A]">
						{message.subject}
					</h2>
					<p className="text-sm text-black/50">{message.email}</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="shrink-0 p-1.5 text-black/30 hover:text-black transition-colors"
				>
					<Eye className="h-4 w-4" />
				</button>
			</div>
			<div className="space-y-3">
				<div>
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.22em] text-black/30">
						From
					</p>
					<p className="text-sm font-semibold text-[#0A0A0A]">{message.name}</p>
				</div>
				{message.company && (
					<div>
						<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.22em] text-black/30">
							Company
						</p>
						<p className="text-sm text-[#0A0A0A]">{message.company}</p>
					</div>
				)}
				<div>
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.22em] text-black/30 mb-2">
						Message
					</p>
					<p className="whitespace-pre-wrap rounded bg-black/[0.03] p-4 text-sm leading-6 text-[#0A0A0A]">
						{message.message}
					</p>
				</div>
			</div>
			<div className="flex gap-2 pt-2">
				<a
					href={`mailto:${message.email}`}
					className="flex-1 bg-[#0A0A0A] py-2.5 text-center text-sm font-bold text-white hover:bg-[var(--color-accent)] hover:text-white transition-colors"
				>
					Reply via Email
				</a>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<button
							type="button"
							className="border border-red-200 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</AlertDialogTrigger>
					<AlertDialogContent className="rounded-none border border-black/8 bg-white p-0 sm:max-w-md">
						<AlertDialogHeader className="border-b border-black/8 px-6 py-4">
							<AlertDialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-[#0A0A0A]">
								Delete Message
							</AlertDialogTitle>
							<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.22em] text-black/40">
								This action cannot be undone. The message from &quot;
								{message.name}&quot; will be permanently removed.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter className="px-6 py-4">
							<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-[#0A0A0A]">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => onDelete(message.id)}
								className="rounded-none bg-red-600 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-red-700"
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
