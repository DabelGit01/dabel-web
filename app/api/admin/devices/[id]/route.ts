import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sensorSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	topic: z.string().min(1),
	unit: z.string().optional().nullable(),
	ui: z.enum(["value", "badge"]),
});

const actuatorSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	topic: z.string().min(1),
	ui: z.enum(["button", "switch", "toggle"]),
	payload: z.enum(["SWITCH", "TOGGLE", "ON", "OFF"]),
});

const deviceUpdateSchema = z.object({
	deviceName: z.string().min(1).optional(),
	deviceId: z.string().min(1).optional(),
	deviceType: z.string().min(1).optional(),
	version: z.string().min(1).optional(),
	serialNumber: z.string().min(1).optional(),
	email: z.string().email().optional(),
	sensors: z.array(sensorSchema).optional(),
	actuators: z.array(actuatorSchema).optional(),
});

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/devices"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		const body = await request.json();
		const parsed = deviceUpdateSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid device data", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const device = await prisma.device.update({
			where: { id },
			data: parsed.data,
		});

		return NextResponse.json(device);
	} catch (error) {
		console.error("[API] PATCH /api/admin/devices/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to update device" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAuth("/admin/devices"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		await prisma.device.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] DELETE /api/admin/devices/[id] error:", error);
		return NextResponse.json(
			{ error: "Failed to delete device" },
			{ status: 500 },
		);
	}
}
