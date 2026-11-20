import { cn } from "@/lib/utils";

/**
 * Brand photo grade — drop inside any `relative overflow-hidden` image container,
 * after the <Image>. Adds the Dabel navy→cyan tint and a fine film grain so mixed
 * phone photography reads as one art-directed set. Pair with `data-graded`
 * (or `data-graded="cover"`) on the container to also apply the tonal filter to
 * the photo itself (see globals.css).
 *
 * variant "cover" = stronger, brochure-cover style (hero / page heroes)
 * variant "soft"  = subtle, for cards and section imagery
 * className is applied to both layers (e.g. "-z-10" when text sits on the photo).
 */
export function Grade({ variant = "soft", className }: { variant?: "soft" | "cover"; className?: string }) {
	return (
		<>
			<span aria-hidden="true" className={cn("grade-tint", variant === "cover" && "grade-tint--cover", className)} />
			<span aria-hidden="true" className={cn("grade-grain", className)} />
		</>
	);
}
