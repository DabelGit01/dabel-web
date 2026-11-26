"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	Cpu,
	FileText,
	Globe,
	LayoutDashboard,
	LogOut,
	Mail,
	Menu,
	Package,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogoMark } from "@/components/brand/DabelLogo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { api } from "@/lib/api";

const NAV = [
	{ href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
	{ href: "/admin/messages", label: "Messages", icon: Mail },
	{ href: "/admin/content", label: "Page Content", icon: FileText },
	{ href: "/admin/offers", label: "Offers", icon: Package },
	{ href: "/admin/blog", label: "Blog & Newsletter", icon: BookOpen },
	{ href: "/admin/site-meta", label: "Site Meta", icon: Globe },
	{ href: "/admin/devices", label: "Devices", icon: Cpu },
	{ href: "/admin/admins", label: "Admins", icon: Users },
];

interface NavLinkProps {
	href: string;
	label: string;
	icon: React.ElementType;
	exact?: boolean;
	pathname: string;
	onClick?: () => void;
	disabled?: boolean;
}

function NavLink({
	href,
	label,
	icon: Icon,
	exact,
	pathname,
	onClick,
	disabled,
}: NavLinkProps) {
	const active = exact
		? pathname === href
		: pathname === href || pathname.startsWith(`${href}/`);

	if (disabled) {
		return (
			<div
				className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/20 cursor-not-allowed select-none"
				title="Access Restricted"
			>
				<Icon className="h-4 w-4 shrink-0 opacity-45" />
				{label}
			</div>
		);
	}

	return (
		<Link
			href={href}
			onClick={onClick}
			className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors ${
				active
					? "bg-[var(--color-accent)] text-white"
					: "text-white/55 hover:bg-white/6 hover:text-white"
			}`}
		>
			<Icon className="h-4 w-4 shrink-0" />
			{label}
		</Link>
	);
}

interface SidebarInnerProps {
	pathname: string;
	onNav?: () => void;
	onLogout: () => void;
	permissions: string[];
	email: string;
}

function SidebarInner({
	pathname,
	onNav,
	onLogout,
	permissions,
}: SidebarInnerProps) {
	const isSuper = permissions.includes("*");

	return (
		<div className="admin-sidebar flex h-full flex-col bg-navy">
			<div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/8 px-5">
				<LogoMark className="h-9 w-9 p-1" />
				<span className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-white">
					DABEL
				</span>
				<span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/45">
					ADMIN
				</span>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
				{NAV.map((item) => {
					// Early check: Disable the button if user doesn't have required permission
					const isAllowed =
						item.href === "/admin" ||
						isSuper ||
						permissions.includes(item.href);

					return (
						<NavLink
							key={item.href}
							{...item}
							pathname={pathname}
							onClick={onNav}
							disabled={!isAllowed}
						/>
					);
				})}
			</nav>

			<div className="shrink-0 space-y-1 border-t border-white/8 p-3">
				<div className="flex items-center justify-between px-3 py-1 text-sm font-semibold text-white/60">
					Theme
					<ThemeToggle className="h-9 w-9 text-white" />
				</div>
				<button
					type="button"
					onClick={onLogout}
					className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/35 transition-colors hover:bg-white/6 hover:text-white"
				>
					<LogOut className="h-4 w-4 shrink-0" />
					Logout
				</button>
			</div>
		</div>
	);
}

interface AdminProfile {
	id: string;
	fullName: string;
	email: string;
	permissions: string[];
}

interface AdminShellProps {
	children: React.ReactNode;
	admin: AdminProfile;
}

export function AdminShell({ children, admin }: AdminShellProps) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();

	// Guard client-side page transitions (middleware handles server-side guards)
	useEffect(() => {
		setOpen(false);

		if (!admin) return;

		const isSuper = admin.permissions.includes("*");

		const isAllowed =
			pathname === "/admin" ||
			isSuper ||
			admin.permissions.some(
				(p) => pathname === p || pathname.startsWith(`${p}/`),
			);

		if (!isAllowed) {
			toast.error("You do not have permission to view that page.");
			router.push("/admin");
		}
	}, [pathname, admin, router]);

	async function logout() {
		try {
			await api.post("/admin/logout");
			toast.success("Logged out successfully.");
			router.push("/admin/login");
		} catch (err) {
			console.error("Logout failed:", err);
			router.push("/admin/login");
		}
	}

	return (
		<div className="admin-root flex min-h-screen bg-bg text-fg">
			{/* Desktop sidebar */}
			<aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col md:flex">
				<SidebarInner
					pathname={pathname}
					onLogout={logout}
					permissions={admin.permissions}
					email={admin.email}
				/>
			</aside>

			{/* Mobile overlay + sidebar */}
			<AnimatePresence>
				{open && (
					<>
						<motion.div
							key="overlay"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={() => setOpen(false)}
							className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
						/>
						<motion.aside
							key="sidebar"
							initial={{ x: -240 }}
							animate={{ x: 0 }}
							exit={{ x: -240 }}
							transition={{ type: "spring", damping: 28, stiffness: 320 }}
							className="fixed inset-y-0 left-0 z-50 w-60 md:hidden"
						>
							<SidebarInner
								pathname={pathname}
								onNav={() => setOpen(false)}
								onLogout={logout}
								permissions={admin.permissions}
								email={admin.email}
							/>
						</motion.aside>
					</>
				)}
			</AnimatePresence>

			{/* Main content */}
			<div className="flex flex-1 flex-col md:ml-60">
				{/* Mobile topbar */}
				<div className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 md:hidden">
					<button
						type="button"
						onClick={() => setOpen(true)}
						className="-ml-1 flex h-11 w-11 items-center justify-center rounded-lg text-fg hover:bg-surface-2"
						aria-label="Open menu"
					>
						<Menu className="h-5 w-5" />
					</button>
					<span className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-fg">
						DABEL ADMIN
					</span>
					<ThemeToggle className="ml-auto h-10 w-10 text-fg" />
				</div>

				<main className="flex-1 p-4 md:p-8">{children}</main>
			</div>
		</div>
	);
}
