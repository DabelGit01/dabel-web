"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api";

export default function AdminLoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [show, setShow] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await api.post("/admin/login", { email, password });

			toast.success("Successfully authenticated!");
			router.push("/admin");
		} catch (err) {
			const loginErr = err as {
				response?: {
					status?: number;
					data?: {
						error?: string;
						message?: string;
					};
				};
			};
			const status = loginErr.response?.status;
			const data = loginErr.response?.data || {};

			if (status === 403 && data.error === "none") {
				// Toast for admins with no permissions yet
				toast.error(data.message || "Access denied", {
					duration: 6000,
				});
				setError("Access denied: No permissions assigned.");
			} else {
				const errMsg = data.error || "Invalid credentials";
				setError(errMsg);
				toast.error(errMsg);
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-4">
			<div className="w-full max-w-sm">
				{/* Logo mark */}
				<div className="mb-10 text-center">
					<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5">
						<Lock className="h-6 w-6 text-[var(--color-accent)]" />
					</div>
					<p className="font-['Playfair_Display'] text-xl font-black uppercase tracking-[0.08em] text-white">
						DABEL ADMIN
					</p>
					<p className="mt-1 font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.28em] text-white/30">
						Restricted Access
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
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
							placeholder="Password"
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
						disabled={loading || !email || !password}
						className="w-full bg-[var(--color-accent)] py-3 font-['Playfair_Display'] text-sm font-black uppercase tracking-[0.08em] text-white transition-all hover:bg-white hover:text-[var(--color-accent)] disabled:opacity-40 cursor-pointer"
					>
						{loading ? "Authenticating..." : "Enter Dashboard"}
					</button>
				</form>

				<div className="mt-6 text-center">
					<Link
						href="/admin/signup"
						className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-white/40 hover:text-[var(--color-accent)] transition-colors"
					>
						Register as new Admin
					</Link>
				</div>

				<p className="mt-8 text-center font-['JetBrains_Mono'] text-[0.55rem] uppercase tracking-[0.22em] text-white/15">
					Dabel Resources -- Internal Use Only
				</p>
			</div>
		</div>
	);
}
