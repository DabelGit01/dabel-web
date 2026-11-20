import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session.admin) {
		redirect("/admin/login");
	}

	return <AdminShell admin={session.admin}>{children}</AdminShell>;
}
