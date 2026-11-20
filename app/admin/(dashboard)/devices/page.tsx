"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import DeviceDialog from "@/components/admin/devices/DeviceDialog";
import DevicesList, {
	type Device,
} from "@/components/admin/devices/DevicesList";

import { api } from "@/lib/api";

export default function DevicesPage() {
	const [devices, setDevices] = useState<Device[]>([]);
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Device | null>(null);

	useEffect(() => {
		async function loadDevices() {
			setLoading(true);
			try {
				const r = await api.get("/admin/devices");
				setDevices(r.data);
			} catch (err) {
				console.error("Failed to load devices", err);
			} finally {
				setLoading(false);
			}
		}

		loadDevices();
	}, []);

	function openCreate() {
		setEditing(null);
		setOpen(true);
	}

	function openEdit(d: Device) {
		setEditing(d);
		setOpen(true);
	}

	async function handleDelete(id: string) {
		try {
			await api.delete(`/admin/devices/${id}`);
			setDevices((prev) => prev.filter((d) => d.id !== id));
		} catch (err) {
			console.error("Failed to delete device", err);
		}
	}

	function handleSave(saved: Device) {
		setDevices((prev) =>
			editing
				? prev.map((x) => (x.id === saved.id ? saved : x))
				: [saved, ...prev],
		);
	}

	return (
		<div className="max-w-6xl space-y-6">
			{/* Header */}
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.28em] text-black/30 mb-1">
						IOT DEVICES
					</p>
					<h1 className="font-['Playfair_Display'] text-2xl font-black uppercase tracking-tight text-[#0A0A0A] md:text-3xl">
						Devices
					</h1>
				</div>
				<button
					type="button"
					onClick={openCreate}
					className="flex items-center gap-2 bg-[#0A0A0A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-accent)] hover:text-white transition-colors"
				>
					<Plus className="h-4 w-4" /> Add Device
				</button>
			</div>

			<DevicesList
				devices={devices}
				loading={loading}
				onEdit={openEdit}
				onDelete={handleDelete}
			/>

			<DeviceDialog
				open={open}
				onOpenChange={setOpen}
				editing={editing}
				onSave={handleSave}
			/>
		</div>
	);
}
