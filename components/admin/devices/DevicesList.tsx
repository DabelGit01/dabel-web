"use client";

import {
	ChevronDown,
	ChevronUp,
	Cpu,
	Edit2,
	Search,
	Trash2,
} from "lucide-react";
import { Fragment, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export interface Sensor {
	id: string;
	name: string;
	topic: string;
	unit?: string | null;
	ui: "value" | "badge";
}

export interface Actuator {
	id: string;
	name: string;
	topic: string;
	ui: "button" | "switch" | "toggle";
	payload: "SWITCH" | "TOGGLE" | "ON" | "OFF";
}

export interface Device {
	id: string;
	deviceName: string;
	deviceId: string;
	deviceType: string;
	version: string;
	serialNumber: string;
	email: string;
	sensors: Sensor[];
	actuators: Actuator[];
	createdAt: string;
	updatedAt: string;
}

interface DevicesListProps {
	devices: Device[];
	loading: boolean;
	onEdit: (d: Device) => void;
	onDelete: (id: string) => void;
}

const SECTION_LABEL =
	"font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.28em] text-black/30 mb-1";
const TH =
	"font-['JetBrains_Mono'] text-[0.58rem] uppercase tracking-[0.2em] text-black/35";

export default function DevicesList({
	devices,
	loading,
	onEdit,
	onDelete,
}: DevicesListProps) {
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [expanded, setExpanded] = useState<string | null>(null);

	const deviceTypes = Array.from(
		new Set(devices.map((d) => d.deviceType).filter(Boolean)),
	);

	const filteredDevices = devices.filter((d) => {
		const matchSearch =
			d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
			d.deviceId.toLowerCase().includes(search.toLowerCase()) ||
			d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
			d.email.toLowerCase().includes(search.toLowerCase());
		const matchType = typeFilter === "all" || d.deviceType === typeFilter;
		return matchSearch && matchType;
	});

	const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
	const effectiveCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
	const displayedDevices = filteredDevices.slice(
		(effectiveCurrentPage - 1) * itemsPerPage,
		effectiveCurrentPage * itemsPerPage,
	);

	return (
		<div className="space-y-6">
			{/* Filters */}
			{devices.length > 0 && (
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative flex-1 min-w-60">
						<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/30" />
						<input
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Search devices by name, ID, serial, owner email..."
							className="w-full border border-black/8 bg-white pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-black/30 focus:border-foreground focus:outline-none"
						/>
					</div>
					<div className="w-48">
						<select
							value={typeFilter}
							onChange={(e) => {
								setTypeFilter(e.target.value);
								setCurrentPage(1);
							}}
							className="w-full border border-black/8 bg-white px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
						>
							<option value="all">All Types</option>
							{deviceTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="border border-black/8 bg-white">
				{loading ? (
					<div className="flex items-center justify-center py-16 text-sm text-black/35">
						Loading...
					</div>
				) : devices.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<Cpu className="mb-3 h-8 w-8 text-black/15" />
						<p className="text-sm font-semibold text-black/40">
							No devices yet
						</p>
					</div>
				) : filteredDevices.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<Search className="mb-3 h-8 w-8 text-black/15" />
						<p className="text-sm font-semibold text-black/40">
							No devices match search/filter criteria
						</p>
					</div>
				) : (
					<Table>
						<TableHeader className="border-b border-black/8 bg-black/2">
							<TableRow className="border-b border-black/5 hover:bg-transparent">
								<TableHead className={`${TH} h-auto px-5 py-3 text-left`}>
									Name
								</TableHead>
								<TableHead className={`${TH} h-auto px-5 py-3 text-left`}>
									Device ID
								</TableHead>
								<TableHead className={`${TH} h-auto px-5 py-3 text-left`}>
									Type
								</TableHead>
								<TableHead className={`${TH} h-auto px-5 py-3 text-left`}>
									Version
								</TableHead>
								<TableHead className={`${TH} h-auto px-5 py-3 text-left`}>
									Serial
								</TableHead>
								<TableHead className={`${TH} h-auto px-5 py-3 text-left`}>
									Email
								</TableHead>
								<TableHead className={`${TH} h-auto px-5 py-3 text-center`}>
									S / A
								</TableHead>
								<TableHead className={`${TH} h-auto px-5 py-3 text-right`}>
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{displayedDevices.map((d) => (
								<Fragment key={d.id}>
									<TableRow className="border-b border-black/5 transition-colors hover:bg-black/1">
										{/* Name */}
										<TableCell className="px-5 py-4 text-left align-middle">
											<div>
												<p className="text-sm font-semibold text-foreground">
													{d.deviceName}
												</p>
												<p className="truncate font-['JetBrains_Mono'] text-[0.6rem] text-black/35 lg:hidden">
													{d.deviceId}
												</p>
											</div>
										</TableCell>

										{/* Device ID */}
										<TableCell className="px-5 py-4 text-left align-middle font-['JetBrains_Mono'] text-xs text-black/50">
											{d.deviceId}
										</TableCell>

										{/* Type */}
										<TableCell className="px-5 py-4 text-left align-middle font-['JetBrains_Mono'] text-[0.6rem] text-black/35">
											{d.deviceType}
										</TableCell>

										{/* Version */}
										<TableCell className="px-5 py-4 text-left align-middle font-['JetBrains_Mono'] text-[0.6rem] text-black/35">
											{d.version}
										</TableCell>

										{/* Serial */}
										<TableCell className="px-5 py-4 text-left align-middle font-['JetBrains_Mono'] text-[0.6rem] text-black/35">
											{d.serialNumber}
										</TableCell>

										{/* Email */}
										<TableCell className="px-5 py-4 text-left align-middle text-xs text-black/45">
											{d.email}
										</TableCell>

										{/* Sensor / Actuator counts */}
										<TableCell className="px-5 py-4 text-center align-middle">
											<button
												type="button"
												onClick={() =>
													setExpanded(expanded === d.id ? null : d.id)
												}
												className="mx-auto flex items-center justify-center gap-1.5"
											>
												<span className="bg-accent px-1.5 py-0.5 font-['JetBrains_Mono'] text-[0.52rem] font-bold uppercase tracking-wide text-foreground">
													{d.sensors.length}S
												</span>
												<span className="border border-black/10 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[0.52rem] font-bold uppercase tracking-wide text-black/45">
													{d.actuators.length}A
												</span>
												{expanded === d.id ? (
													<ChevronUp className="h-3 w-3 text-black/30" />
												) : (
													<ChevronDown className="h-3 w-3 text-black/30" />
												)}
											</button>
										</TableCell>

										{/* Actions */}
										<TableCell className="px-5 py-4 text-right align-middle">
											<div className="flex justify-end gap-1">
												<button
													type="button"
													onClick={() => onEdit(d)}
													className="flex items-center gap-1.5 border border-black/8 px-3 py-1.5 text-xs font-semibold text-black/60 transition-colors hover:border-foreground hover:text-foreground"
												>
													<Edit2 className="h-3 w-3" /> Edit
												</button>

												{/* Delete — Radix AlertDialog */}
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<button
															type="button"
															className="p-1.5 text-black/25 transition-colors hover:bg-red-50 hover:text-red-500"
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</AlertDialogTrigger>
													<AlertDialogContent className="rounded-none border-black/8 bg-white p-0 sm:max-w-md">
														<AlertDialogHeader className="border-b border-black/8 px-6 py-4">
															<AlertDialogTitle className="font-['Playfair_Display'] text-base font-black uppercase text-foreground">
																Delete Device
															</AlertDialogTitle>
															<AlertDialogDescription className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-[0.18em] text-black/40">
																This action cannot be undone. The device &quot;
																{d.deviceName}&quot; and all its sensors and
																actuators will be permanently removed.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter className="px-6 py-4">
															<AlertDialogCancel className="rounded-none border-black/10 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-black/60 hover:bg-black/5 hover:text-foreground">
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => onDelete(d.id)}
																className="rounded-none bg-red-600 font-['Inter'] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-red-700"
															>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>

									{/* Expanded detail: sensors + actuators */}
									{expanded === d.id && (
										<TableRow className="bg-black/1.5 hover:bg-black/1.5">
											<TableCell
												colSpan={8}
												className="border-b border-black/5 px-5 py-4"
											>
												<div className="grid gap-6 text-left md:grid-cols-2">
													{/* Sensors */}
													<div>
														<p className={SECTION_LABEL}>
															Sensors ({d.sensors.length})
														</p>
														{d.sensors.length === 0 ? (
															<p className="mt-1 text-xs text-black/30">None</p>
														) : (
															<div className="mt-2 space-y-2">
																{d.sensors.map((s) => (
																	<div
																		key={s.id}
																		className="border border-black/8 bg-white px-3 py-2.5"
																	>
																		<div className="flex items-start justify-between gap-2">
																			<p className="text-sm font-semibold text-foreground">
																				{s.name}
																			</p>
																			<span className="shrink-0 bg-accent px-1.5 py-0.5 font-['JetBrains_Mono'] text-[0.48rem] font-bold uppercase text-foreground">
																				{s.ui}
																			</span>
																		</div>
																		<p className="mt-0.5 font-['JetBrains_Mono'] text-[0.58rem] text-black/40">
																			ID: {s.id} · Topic: {s.topic}
																			{s.unit ? ` · Unit: ${s.unit}` : ""}
																		</p>
																	</div>
																))}
															</div>
														)}
													</div>

													{/* Actuators */}
													<div>
														<p className={SECTION_LABEL}>
															Actuators ({d.actuators.length})
														</p>
														{d.actuators.length === 0 ? (
															<p className="mt-1 text-xs text-black/30">None</p>
														) : (
															<div className="mt-2 space-y-2">
																{d.actuators.map((a) => (
																	<div
																		key={a.id}
																		className="border border-black/8 bg-white px-3 py-2.5"
																	>
																		<div className="flex items-start justify-between gap-2">
																			<p className="text-sm font-semibold text-foreground">
																				{a.name}
																			</p>
																			<div className="flex gap-1">
																				<span className="border border-black/10 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[0.48rem] font-bold uppercase text-black/45">
																					{a.ui}
																				</span>
																				<span className="border border-black/10 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[0.48rem] font-bold uppercase text-black/45">
																					{a.payload}
																				</span>
																			</div>
																		</div>
																		<p className="mt-0.5 font-['JetBrains_Mono'] text-[0.58rem] text-black/40">
																			ID: {a.id} · Topic: {a.topic}
																		</p>
																	</div>
																))}
															</div>
														)}
													</div>
												</div>
											</TableCell>
										</TableRow>
									)}
								</Fragment>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Pagination Controls */}
			{devices.length > 0 && filteredDevices.length > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-4 border border-black/8 bg-white px-5 py-4">
					{/* Left: Items per page selector */}
					<div className="flex items-center gap-2">
						<span className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
							Show
						</span>
						<select
							value={itemsPerPage}
							onChange={(e) => {
								setItemsPerPage(Number(e.target.value));
								setCurrentPage(1);
							}}
							className="border border-black/8 bg-white px-2 py-1 text-xs text-foreground focus:border-foreground focus:outline-none"
						>
							{[5, 10, 20, 50].map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
						<span className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
							per page
						</span>
					</div>

					{/* Middle: Status text */}
					<div className="font-['JetBrains_Mono'] text-[0.6rem] uppercase tracking-wider text-black/40">
						Showing{" "}
						{Math.min(
							filteredDevices.length,
							(effectiveCurrentPage - 1) * itemsPerPage + 1,
						)}{" "}
						to{" "}
						{Math.min(
							filteredDevices.length,
							effectiveCurrentPage * itemsPerPage,
						)}{" "}
						of {filteredDevices.length} devices
					</div>

					{/* Right: Page navigation */}
					<div className="flex items-center gap-1">
						<button
							type="button"
							disabled={effectiveCurrentPage === 1}
							onClick={() => setCurrentPage(1)}
							className="border border-black/8 bg-white px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-black/60 hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:hover:border-black/8 disabled:hover:text-black/60 transition-colors"
						>
							First
						</button>
						<button
							type="button"
							disabled={effectiveCurrentPage === 1}
							onClick={() => setCurrentPage(effectiveCurrentPage - 1)}
							className="border border-black/8 bg-white px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-black/60 hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:hover:border-black/8 disabled:hover:text-black/60 transition-colors"
						>
							Prev
						</button>

						{/* Quick page indicators */}
						{Array.from({ length: totalPages }, (_, i) => i + 1)
							.filter((p) => {
								return (
									Math.abs(p - effectiveCurrentPage) <= 1 ||
									p === 1 ||
									p === totalPages
								);
							})
							.map((p, idx, arr) => {
								const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
								return (
									<Fragment key={p}>
										{showEllipsisBefore && (
											<span className="px-1 text-xs font-bold text-black/30">
												...
											</span>
										)}
										<button
											type="button"
											onClick={() => setCurrentPage(p)}
											className={`px-3 py-1.5 text-xs font-bold transition-colors ${
												effectiveCurrentPage === p
													? "bg-foreground text-white"
													: "border border-black/8 bg-white text-black/60 hover:border-foreground hover:text-foreground"
											}`}
										>
											{p}
										</button>
									</Fragment>
								);
							})}

						<button
							type="button"
							disabled={effectiveCurrentPage === totalPages}
							onClick={() => setCurrentPage(effectiveCurrentPage + 1)}
							className="border border-black/8 bg-white px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-black/60 hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:hover:border-black/8 disabled:hover:text-black/60 transition-colors"
						>
							Next
						</button>
						<button
							type="button"
							disabled={effectiveCurrentPage === totalPages}
							onClick={() => setCurrentPage(totalPages)}
							className="border border-black/8 bg-white px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-black/60 hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:hover:border-black/8 disabled:hover:text-black/60 transition-colors"
						>
							Last
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
