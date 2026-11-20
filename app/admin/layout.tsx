import type { Metadata } from "next";
import { AdminScope } from "@/components/admin/AdminScope";

export const metadata: Metadata = {
	title: "Admin",
	robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<AdminScope />
			{children}
		</>
	);
}
