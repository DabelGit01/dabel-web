"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const dark = mounted && resolvedTheme === "dark";
	return (
		<button
			type="button"
			onClick={() => setTheme(dark ? "light" : "dark")}
			aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
			title={dark ? "Light mode" : "Dark mode"}
			className={cn(
				"relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ring-1 ring-current/25 transition hover:ring-current/60",
				className,
			)}
		>
			<Sun
				className={cn(
					"absolute h-[18px] w-[18px] transition-all duration-500",
					dark ? "translate-y-0 rotate-0 opacity-100" : "translate-y-6 rotate-90 opacity-0",
				)}
			/>
			<Moon
				className={cn(
					"absolute h-[18px] w-[18px] transition-all duration-500",
					dark ? "-translate-y-6 -rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100",
				)}
			/>
		</button>
	);
}
