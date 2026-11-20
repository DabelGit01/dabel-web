"use client";

import { CheckCircle2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api";

export default function AdminSignupPage() {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [show, setShow] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		// Client-side validations
		if (fullName.trim().length < 2) {
			setError("Full name must be at least 2 characters.");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}

		setLoading(true);

		try {
			await api.post("/admin/signup", {
				fullName,
				email,
				password,
			});

			toast.success("Registration request submitted successfully!");
			setSuccess(true);
		} catch (err) {
			const apiErr = err as { response?: { data?: { error?: string } } };
			const data = apiErr.response?.data || {};
			setError(data.error || "Failed to register.");
			toast.error(data.error || "Failed to register.");
		} finally {
			setLoading(false);
		}
	}

	if (success) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-4">
				<div className="w-full max-w-sm text-center border border-white/10 bg-white/5 p-8">
					<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-emerald-500/20 bg-emerald-500/5">
						<CheckCircle2 className="h-6 w-6 text-emerald-500" />
					</div>

					<h2 className="font-['Playfair_Display'] text-xl font-black uppercase tracking-[0.08em] text-white mb-3">
						Registration Complete
					</h2>

					<p className="font-['Inter'] text-xs leading-relaxed text-white/55 mb-8">
						Your admin account has been created successfully with{" "}
						<span className="text-[var(--color-accent)] font-semibold">
							permissions of none
						</span>
						. Before you can log in, you must contact a Super Admin to assign
						you permissions.
					</p>

					<Link
						href="/admin/login"
						className="inline-block w-full bg-[var(--color-accent)] py-3 font-['Playfair_Display'] text-sm font-black uppercase tracking-[0.08em] text-white transition-all hover:bg-white hover:text-[var(--color-accent)]"
					>
						Go to Login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-4">
			<div className="w-full max-w-sm">
				{/* Logo mark */}
				<div className="mb-10 text-center">
					<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5">
						<User className="h-6 w-6 text-[var(--color-accent)]" />
					</div>
					<p className="font-['Playfair_Display'] text-xl font-black uppercase tracking-[0.08em] text-white">
						ADMIN SIGNUP
					</p>
					<p className="mt-1 font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.28em] text-white/30">
						Create new credentials
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="relative">
						<input
							type="text"
							placeholder="Full Name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							disabled={loading}
							required
							className="w-full border border-white/10 bg-white/5 px-4 py-3 pl-10 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
						/>
						<User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
					</div>

					<div className="relative">
						<input
							type="email"
							placeholder="Admin Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
							required
							className="w-full border border-white/10 bg-white/5 px-4 py-3 pl-10 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
						/>
						<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
					</div>

					<div className="relative">
						<input
							type={show ? "text" : "password"}
							placeholder="Password (Min. 8 characters)"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							required
							className="w-full border border-white/10 bg-white/5 px-4 py-3 pl-10 pr-12 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
						/>
						<Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
						<button
							type="button"
							onClick={() => setShow(!show)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
							tabIndex={-1}
						>
							{show ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>

					{error && (
						<p className="font-['JetBrains_Mono'] text-[0.62rem] uppercase tracking-[0.18em] text-red-400">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={loading || !fullName || !email || !password}
						className="w-full bg-[var(--color-accent)] py-3 font-['Playfair_Display'] text-sm font-black uppercase tracking-[0.08em] text-white transition-all hover:bg-white hover:text-[var(--color-accent)] disabled:opacity-40 cursor-pointer"
					>
						{loading ? "Registering..." : "Register"}
					</button>
				</form>

				<div className="mt-6 text-center">
					<Link
						href="/admin/login"
						className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-white/40 hover:text-[var(--color-accent)] transition-colors"
					>
						Back to Login
					</Link>
				</div>

				<p className="mt-8 text-center font-['JetBrains_Mono'] text-[0.55rem] uppercase tracking-[0.22em] text-white/15">
					Dabel Resources -- Internal Use Only
				</p>
			</div>
		</div>
	);
}
