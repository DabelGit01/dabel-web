"use client";

import { useEffect, useState } from "react";
import ProductsTab from "@/components/admin/products/ProductsTab";
import { api } from "@/lib/api";

interface Offer {
	id: string;
	slug: string;
	name: string;
	category: string;
	status: string;
	description: string;
	subTopic: string;
	price: number | null;
	purchaseUrl: string | null;
	imageUrl: string | null;
	gallery?: { url: string; title: string }[] | null;
	tags: string[];
	published: boolean;
	order: number;
}

export default function OffersPage() {
	const [offers, setOffers] = useState<Offer[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadOffers() {
			setLoading(true);
			try {
				const res = await api.get("/admin/offers");
				setOffers(res.data);
			} catch (err) {
				console.error("Failed to load offers", err);
			} finally {
				setLoading(false);
			}
		}
		loadOffers();
	}, []);

	return (
		<div className="max-w-6xl space-y-6">
			{/* Header */}
			<div>
				<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.28em] text-black/30 mb-1">
					CATALOGUE
				</p>
				<h1 className="font-['Playfair_Display'] text-2xl font-black uppercase tracking-tight text-[#0A0A0A] md:text-3xl">
					Our Offers
				</h1>
			</div>

			<ProductsTab
				products={offers}
				setProducts={setOffers}
				loading={loading}
			/>
		</div>
	);
}
