"use client";

import { Award, Globe, MapPin, PhoneCall, Share2, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CertificationsTab from "@/components/admin/site-meta/CertificationsTab";
import ContactDetailsTab from "@/components/admin/site-meta/ContactDetailsTab";
import LandingMetaTab from "@/components/admin/site-meta/LandingMetaTab";
import OfficesTab from "@/components/admin/site-meta/OfficesTab";
import SocialLinksTab from "@/components/admin/site-meta/SocialLinksTab";
import TeamMembersTab from "@/components/admin/site-meta/TeamMembersTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SiteMetaAdmin() {
	const searchParams = useSearchParams();
	const tabQuery = searchParams?.get("tab");
	const [activeTab, setActiveTab] = useState(tabQuery || "meta");

	useEffect(() => {
		if (tabQuery) {
			setActiveTab(tabQuery);
		}
	}, [tabQuery]);

	return (
		<div className="max-w-6xl space-y-6">
			{/* Header */}
			<div>
				<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.28em] text-black/30 mb-1">
					GLOBAL META
				</p>
				<h1 className="font-['Playfair_Display'] text-2xl font-black uppercase tracking-tight text-[#0A0A0A] md:text-3xl">
					Site Settings
				</h1>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="mb-4 bg-black/5 p-1 rounded-none border border-black/8">
					<TabsTrigger
						value="meta"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<Globe className="h-3.5 w-3.5" /> Landing Meta
					</TabsTrigger>
					<TabsTrigger
						value="certs"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<Award className="h-3.5 w-3.5" /> Certifications
					</TabsTrigger>
					<TabsTrigger
						value="offices"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<MapPin className="h-3.5 w-3.5" /> Where We Operate
					</TabsTrigger>
					<TabsTrigger
						value="socials"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<Share2 className="h-3.5 w-3.5" /> Social Icons
					</TabsTrigger>
					<TabsTrigger
						value="team"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<Users className="h-3.5 w-3.5" /> Team Members
					</TabsTrigger>
					<TabsTrigger
						value="contacts"
						className="flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider font-['JetBrains_Mono']"
					>
						<PhoneCall className="h-3.5 w-3.5" /> Contact Details
					</TabsTrigger>
				</TabsList>

				<LandingMetaTab />
				<CertificationsTab />
				<OfficesTab />
				<SocialLinksTab />
				<TeamMembersTab />
				<ContactDetailsTab />
			</Tabs>
		</div>
	);
}
