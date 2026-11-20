"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";

export const SUBJECTS = [
	"General Inquiry",
	"Request a quote",
	"Marine Logistics",
	"Consultancy / Environmental",
	"Procurement",
	"Partnership",
	"Careers / HR Outsourcing",
	"Other",
] as const;

const schema = z.object({
	name: z.string().min(2, "Please enter your full name"),
	email: z.string().email("Enter a valid email address"),
	phone: z.string().optional(),
	company: z.string().optional(),
	subject: z.string().min(2, "Choose a subject"),
	message: z.string().min(10, "Tell us a little more (10+ characters)"),
});
type FormData = z.infer<typeof schema>;

const field =
	"w-full rounded-2xl bg-bg px-4 py-3.5 text-[15px] text-fg ring-1 ring-line placeholder:text-fg-muted/70 transition focus:outline-none focus:ring-2 focus:ring-brand";

function Field({
	id,
	label,
	error,
	children,
	optional,
}: {
	id: string;
	label: string;
	error?: string;
	children: React.ReactNode;
	optional?: boolean;
}) {
	return (
		<div className="space-y-2">
			<label htmlFor={id} className="flex items-baseline justify-between text-sm font-semibold text-fg">
				{label}
				{optional && <span className="text-xs font-normal text-fg-muted">Optional</span>}
			</label>
			{children}
			{error && (
				<p id={`${id}-err`} className="text-sm text-destructive" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}

export function ContactForm({ defaults }: { defaults?: Partial<FormData> }) {
	const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			...defaults,
			subject: defaults?.subject || "General Inquiry",
			message: defaults?.message || "",
		},
	});

	async function onSubmit(data: FormData) {
		setStatus("idle");
		try {
			const res = await fetch("/api/public/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error();
			setStatus("ok");
			reset({ subject: "General Inquiry", name: "", email: "", phone: "", company: "", message: "" });
		} catch {
			setStatus("err");
		}
	}

	const aria = (k: keyof FormData) => ({
		"aria-invalid": !!errors[k],
		"aria-describedby": errors[k] ? `${k}-err` : undefined,
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
			<div className="grid gap-5 sm:grid-cols-2">
				<Field id="name" label="Full name" error={errors.name?.message}>
					<input id="name" autoComplete="name" placeholder="Jane Okafor" className={field} {...register("name")} {...aria("name")} />
				</Field>
				<Field id="email" label="Email" error={errors.email?.message}>
					<input id="email" type="email" autoComplete="email" placeholder="jane@company.com" className={field} {...register("email")} {...aria("email")} />
				</Field>
				<Field id="phone" label="Phone / WhatsApp" optional>
					<input id="phone" type="tel" autoComplete="tel" placeholder="0802 000 0000" className={field} {...register("phone")} />
				</Field>
				<Field id="company" label="Company" optional>
					<input id="company" autoComplete="organization" placeholder="Company name" className={field} {...register("company")} />
				</Field>
			</div>
			<Field id="subject" label="Subject" error={errors.subject?.message}>
				<select id="subject" className={cn(field, "appearance-none")} {...register("subject")} {...aria("subject")}>
					{SUBJECTS.map((s) => (
						<option key={s}>{s}</option>
					))}
				</select>
			</Field>
			<Field id="message" label="Message" error={errors.message?.message}>
				<textarea
					id="message"
					rows={6}
					placeholder="Tell us about the operation, location and timeline…"
					className={cn(field, "resize-y")}
					{...register("message")}
					{...aria("message")}
				/>
			</Field>

			<AnimatePresence>
				{status !== "idle" && (
					<motion.p
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						role="status"
						className={cn(
							"flex items-center gap-3 rounded-2xl p-4 text-sm ring-1",
							status === "ok"
								? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300"
								: "bg-destructive/10 text-destructive ring-destructive/30",
						)}
					>
						{status === "ok" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
						{status === "ok"
							? "Thank you — your message is in. Our team will get back to you shortly."
							: "We couldn't send your message. Please try again or call us directly."}
					</motion.p>
				)}
			</AnimatePresence>

			<button
				type="submit"
				disabled={isSubmitting}
				className="group flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-brand px-8 font-semibold text-brand-contrast transition hover:bg-[#4cc8f4] disabled:opacity-60 sm:w-auto"
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-5 w-5 animate-spin" /> Sending…
					</>
				) : (
					<>
						Send message <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
					</>
				)}
			</button>
		</form>
	);
}
