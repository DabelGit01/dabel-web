"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { Actuator, Device, Sensor } from "./DevicesList";

interface DeviceDialogProps {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	editing: Device | null;
	onSave: (saved: Device) => void;
}

interface DeviceForm {
	deviceName: string;
	deviceId: string;
	deviceType: string;
	version: string;
	serialNumber: string;
	email: string;
	sensors: Sensor[];
	actuators: Actuator[];
}

const emptyForm: DeviceForm = {
	deviceName: "",
	deviceId: "",
	deviceType: "",
	version: "",
	serialNumber: "",
	email: "",
	sensors: [],
	actuators: [],
};

const emptySensor: Sensor = {
	id: "",
	name: "",
	topic: "",
	unit: "",
	ui: "value",
};

const emptyActuator: Actuator = {
	id: "",
	name: "",
	topic: "",
	ui: "button",
	payload: "SWITCH",
};

const SENSOR_UI_OPTIONS: Sensor["ui"][] = ["value", "badge"];
const ACTUATOR_UI_OPTIONS: Actuator["ui"][] = ["button", "switch", "toggle"];
const ACTUATOR_PAYLOAD_OPTIONS: Actuator["payload"][] = [
	"SWITCH",
	"TOGGLE",
	"ON",
	"OFF",
];

const LABEL =
	"mb-1.5 block font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.2em] text-black/40";
const INPUT =
	"w-full border border-black/10 px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none";
const SELECT = INPUT;
const SECTION_LABEL =
	"font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.28em] text-black/30 mb-1";
const SUBMIT_BTN =
	"w-full bg-[#0A0A0A] py-3 font-['Playfair_Display'] text-sm font-black uppercase tracking-[0.06em] text-white hover:bg-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-40";

export default function DeviceDialog({
	open,
	onOpenChange,
	editing,
	onSave,
}: DeviceDialogProps) {
	const [form, setForm] = useState<DeviceForm>(emptyForm);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open) {
			if (editing) {
				setForm({
					deviceName: editing.deviceName,
					deviceId: editing.deviceId,
					deviceType: editing.deviceType,
					version: editing.version,
					serialNumber: editing.serialNumber,
					email: editing.email,
					sensors: editing.sensors.map((s) => ({ ...s })),
					actuators: editing.actuators.map((a) => ({ ...a })),
				});
			} else {
				setForm(emptyForm);
			}
		}
	}, [open, editing]);

	/*  sensor helpers  */
	function addSensor() {
		setForm((f) => ({ ...f, sensors: [...f.sensors, { ...emptySensor }] }));
	}
	function removeSensor(idx: number) {
		setForm((f) => ({ ...f, sensors: f.sensors.filter((_, i) => i !== idx) }));
	}
	function updateSensor(idx: number, key: keyof Sensor, value: string) {
		setForm((f) => ({
			...f,
			sensors: f.sensors.map((s, i) =>
				i === idx ? { ...s, [key]: value } : s,
			),
		}));
	}

	/*  actuator helpers  */
	function addActuator() {
		setForm((f) => ({
			...f,
			actuators: [...f.actuators, { ...emptyActuator }],
		}));
	}
	function removeActuator(idx: number) {
		setForm((f) => ({
			...f,
			actuators: f.actuators.filter((_, i) => i !== idx),
		}));
	}
	function updateActuator(idx: number, key: keyof Actuator, value: string) {
		setForm((f) => ({
			...f,
			actuators: f.actuators.map((a, i) =>
				i === idx ? { ...a, [key]: value } : a,
			),
		}));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		const payload = {
			...form,
			sensors: form.sensors.map((s) => ({ ...s, unit: s.unit || null })),
		};
		try {
			const url = editing ? `/admin/devices/${editing.id}` : "/admin/devices";
			const res = editing
				? await api.patch(url, payload)
				: await api.post(url, payload);
			const saved = res.data;
			onSave(saved);
			onOpenChange(false);
		} catch (err: any) {
			toast.error(
				err instanceof Error ? err.message : "Failed to save device.",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="max-h-[90vh] overflow-y-auto rounded-none border-black/8 bg-white p-0 sm:max-w-2xl"
			>
				{/* Header */}
				<DialogHeader className="border-b border-black/8 px-6 py-4">
					<DialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-foreground">
						{editing ? "Edit Device" : "New Device"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 p-6 w-full min-w-0">
					{/* Device Name + Device ID */}
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label htmlFor="device-name" className={LABEL}>
								Device Name *
							</label>
							<input
								id="device-name"
								required
								value={form.deviceName}
								onChange={(e) =>
									setForm({ ...form, deviceName: e.target.value })
								}
								className={INPUT}
								placeholder="e.g. Smart Relay Module"
							/>
						</div>
						<div>
							<label htmlFor="device-id" className={LABEL}>
								Device ID *
							</label>
							<input
								id="device-id"
								required
								value={form.deviceId}
								onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
								className={`${INPUT} font-['JetBrains_Mono'] text-xs`}
								placeholder="e.g. SRL-001"
							/>
						</div>
					</div>

					{/* Device Type + Version */}
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label htmlFor="device-type" className={LABEL}>
								Device Type *
							</label>
							<input
								id="device-type"
								required
								value={form.deviceType}
								onChange={(e) =>
									setForm({ ...form, deviceType: e.target.value })
								}
								className={INPUT}
								placeholder="e.g. relay, sensor-hub"
							/>
						</div>
						<div>
							<label htmlFor="device-version" className={LABEL}>
								Version *
							</label>
							<input
								id="device-version"
								required
								value={form.version}
								onChange={(e) => setForm({ ...form, version: e.target.value })}
								className={INPUT}
								placeholder="e.g. 1.0.0"
							/>
						</div>
					</div>

					{/* Serial Number + Email */}
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label htmlFor="device-serial" className={LABEL}>
								Serial Number *
							</label>
							<input
								id="device-serial"
								required
								value={form.serialNumber}
								onChange={(e) =>
									setForm({ ...form, serialNumber: e.target.value })
								}
								className={`${INPUT} font-['JetBrains_Mono'] text-xs`}
								placeholder="e.g. SN-20240601-001"
							/>
						</div>
						<div>
							<label htmlFor="device-email" className={LABEL}>
								Email *
							</label>
							<input
								id="device-email"
								required
								type="email"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								className={INPUT}
								placeholder="owner@example.com"
							/>
						</div>
					</div>

					{/* ---- Sensors ---- */}
					<div className="border-t border-black/8 pt-4">
						<div className="mb-3 flex items-center justify-between">
							<p className={SECTION_LABEL}>Sensors ({form.sensors.length})</p>
							<button
								type="button"
								onClick={addSensor}
								className="flex items-center gap-1 border border-black/10 px-2.5 py-1 text-xs font-semibold text-black/60 transition-colors hover:border-accent hover:bg-accent hover:text-foreground"
							>
								<Plus className="h-3 w-3" /> Add Sensor
							</button>
						</div>
						{form.sensors.map((s, idx) => (
							<div
								key={s.id || idx}
								className="mb-2 border border-black/8 bg-black/1.5 p-3"
							>
								<div className="mb-2 flex items-center justify-between">
									<span className="font-['JetBrains_Mono'] text-[0.55rem] uppercase tracking-[0.2em] text-black/30">
										Sensor {idx + 1}
									</span>
									<button
										type="button"
										onClick={() => removeSensor(idx)}
										className="p-0.5 text-black/25 transition-colors hover:text-red-500"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
									<div>
										<label htmlFor={`sensor-id-${idx}`} className={LABEL}>
											ID *
										</label>
										<input
											id={`sensor-id-${idx}`}
											required
											value={s.id}
											onChange={(e) => updateSensor(idx, "id", e.target.value)}
											className={INPUT}
											placeholder="s1"
										/>
									</div>
									<div>
										<label htmlFor={`sensor-name-${idx}`} className={LABEL}>
											Name *
										</label>
										<input
											id={`sensor-name-${idx}`}
											required
											value={s.name}
											onChange={(e) =>
												updateSensor(idx, "name", e.target.value)
											}
											className={INPUT}
											placeholder="Temperature"
										/>
									</div>
									<div>
										<label htmlFor={`sensor-topic-${idx}`} className={LABEL}>
											Topic *
										</label>
										<input
											id={`sensor-topic-${idx}`}
											required
											value={s.topic}
											onChange={(e) =>
												updateSensor(idx, "topic", e.target.value)
											}
											className={INPUT}
											placeholder="device/temp"
										/>
									</div>
									<div>
										<label htmlFor={`sensor-unit-${idx}`} className={LABEL}>
											Unit
										</label>
										<input
											id={`sensor-unit-${idx}`}
											value={s.unit ?? ""}
											onChange={(e) =>
												updateSensor(idx, "unit", e.target.value)
											}
											className={INPUT}
											placeholder="°C"
										/>
									</div>
									<div>
										<label htmlFor={`sensor-ui-${idx}`} className={LABEL}>
											UI *
										</label>
										<select
											id={`sensor-ui-${idx}`}
											required
											value={s.ui}
											onChange={(e) => updateSensor(idx, "ui", e.target.value)}
											className={SELECT}
										>
											{SENSOR_UI_OPTIONS.map((o) => (
												<option key={o} value={o}>
													{o}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* ---- Actuators ---- */}
					<div className="border-t border-black/8 pt-4">
						<div className="mb-3 flex items-center justify-between">
							<p className={SECTION_LABEL}>
								Actuators ({form.actuators.length})
							</p>
							<button
								type="button"
								onClick={addActuator}
								className="flex items-center gap-1 border border-black/10 px-2.5 py-1 text-xs font-semibold text-black/60 transition-colors hover:border-accent hover:bg-accent hover:text-foreground"
							>
								<Plus className="h-3 w-3" /> Add Actuator
							</button>
						</div>
						{form.actuators.map((a, idx) => (
							<div
								key={a.id || idx}
								className="mb-2 border border-black/8 bg-black/1.5 p-3"
							>
								<div className="mb-2 flex items-center justify-between">
									<span className="font-['JetBrains_Mono'] text-[0.55rem] uppercase tracking-[0.2em] text-black/30">
										Actuator {idx + 1}
									</span>
									<button
										type="button"
										onClick={() => removeActuator(idx)}
										className="p-0.5 text-black/25 transition-colors hover:text-red-500"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
									<div>
										<label htmlFor={`actuator-id-${idx}`} className={LABEL}>
											ID *
										</label>
										<input
											id={`actuator-id-${idx}`}
											required
											value={a.id}
											onChange={(e) =>
												updateActuator(idx, "id", e.target.value)
											}
											className={INPUT}
											placeholder="a1"
										/>
									</div>
									<div>
										<label htmlFor={`actuator-name-${idx}`} className={LABEL}>
											Name *
										</label>
										<input
											id={`actuator-name-${idx}`}
											required
											value={a.name}
											onChange={(e) =>
												updateActuator(idx, "name", e.target.value)
											}
											className={INPUT}
											placeholder="Main Relay"
										/>
									</div>
									<div>
										<label htmlFor={`actuator-topic-${idx}`} className={LABEL}>
											Topic *
										</label>
										<input
											id={`actuator-topic-${idx}`}
											required
											value={a.topic}
											onChange={(e) =>
												updateActuator(idx, "topic", e.target.value)
											}
											className={INPUT}
											placeholder="device/relay"
										/>
									</div>
									<div>
										<label htmlFor={`actuator-ui-${idx}`} className={LABEL}>
											UI *
										</label>
										<select
											id={`actuator-ui-${idx}`}
											required
											value={a.ui}
											onChange={(e) =>
												updateActuator(idx, "ui", e.target.value)
											}
											className={SELECT}
										>
											{ACTUATOR_UI_OPTIONS.map((o) => (
												<option key={o} value={o}>
													{o}
												</option>
											))}
										</select>
									</div>
									<div>
										<label
											htmlFor={`actuator-payload-${idx}`}
											className={LABEL}
										>
											Payload *
										</label>
										<select
											id={`actuator-payload-${idx}`}
											required
											value={a.payload}
											onChange={(e) =>
												updateActuator(idx, "payload", e.target.value)
											}
											className={SELECT}
										>
											{ACTUATOR_PAYLOAD_OPTIONS.map((o) => (
												<option key={o} value={o}>
													{o}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Footer buttons */}
					<div className="flex gap-3 border-t border-black/8 pt-4">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="flex-1 border border-black/10 py-3 font-['Inter'] text-sm font-bold uppercase tracking-[0.06em] text-black/60 transition-colors hover:bg-black/5 hover:text-foreground"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={saving}
							className={`flex-1 ${SUBMIT_BTN}`}
						>
							{saving
								? "Saving..."
								: editing
									? "Save Changes"
									: "Create Device"}
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
