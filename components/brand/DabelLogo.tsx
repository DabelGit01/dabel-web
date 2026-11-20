import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "auto" | "onDark";

/** Vector redraw of the Dabel mark: three rising bars, indigo swoosh, cyan tips. */
export function DabelMark({
	className,
	tone = "auto",
	animated = false,
}: {
	className?: string;
	tone?: Tone;
	animated?: boolean;
}) {
	const swoosh = tone === "onDark" ? "#9a9ef0" : "var(--indigo)";
	return (
		<svg
			viewBox="0 0 120 100"
			className={cn("shrink-0", className)}
			aria-hidden="true"
			data-animated={animated || undefined}
		>
			<defs>
				<linearGradient id={`dabel-bar-${tone}`} x1="0" y1="0" x2="0" y2="1">
					<stop
						offset="0"
						stopColor={tone === "onDark" ? "#e6e8f2" : "#55576a"}
					/>
					<stop
						offset="1"
						stopColor={tone === "onDark" ? "#e6e8f2" : "#55576a"}
						stopOpacity=".12"
					/>
				</linearGradient>
			</defs>
			<rect className="dm-bar dm-b1" x="46" y="40" width="7" height="42" fill={`url(#dabel-bar-${tone})`} />
			<rect className="dm-bar dm-b2" x="57" y="18" width="7" height="64" fill={`url(#dabel-bar-${tone})`} />
			<rect className="dm-bar dm-b3" x="68" y="28" width="7" height="54" fill={`url(#dabel-bar-${tone})`} />
			<path
				className="dm-sw"
				d="M20 92 C40 62 72 30 98 8"
				stroke={swoosh}
				strokeWidth="7"
				fill="none"
				strokeLinecap="round"
			/>
			<path
				className="dm-sw dm-sw2"
				d="M24 90 C52 72 82 82 104 82"
				stroke={swoosh}
				strokeWidth="6"
				fill="none"
				strokeLinecap="round"
			/>
			<circle className="dm-tip" cx="98" cy="8" r="4.5" fill="#00AEEF" />
			<circle className="dm-tip" cx="104" cy="82" r="4" fill="#00AEEF" />
		</svg>
	);
}

export function DabelLogo({
	tone = "auto",
	className,
	href = "/",
}: {
	tone?: Tone;
	className?: string;
	href?: string | null;
}) {
	const inner = (
		<>
			<DabelMark tone={tone} className="h-9 w-11" />
			<span className="flex flex-col leading-none">
				<span
					className={cn(
						"font-heading text-[15px] font-bold tracking-[0.06em]",
						tone === "onDark" ? "text-white" : "text-indigo dark:text-white",
					)}
				>
					DABEL RESOURCES
				</span>
				<span
					className={cn(
						"mt-1 text-[8.5px] font-medium tracking-[0.42em]",
						tone === "onDark" ? "text-white/70" : "text-fg-muted",
					)}
				>
					VENTURES LIMITED
				</span>
			</span>
		</>
	);

	if (href === null) {
		return <span className={cn("flex items-center gap-2.5", className)}>{inner}</span>;
	}
	return (
		<Link
			href={href}
			aria-label="Dabel Resources home"
			className={cn("flex items-center gap-2.5", className)}
		>
			{inner}
		</Link>
	);
}
