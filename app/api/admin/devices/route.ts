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

const deviceSchema = z.object({
	deviceName: z.string().min(1),
	deviceId: z.string().min(1),
	deviceType: z.string().min(1),
	version: z.string().min(1),
	serialNumber: z.string().min(1),
	email: z.string().email(),
	sensors: z.array(sensorSchema).default([]),
	actuators: z.array(actuatorSchema).default([]),
});

export async function GET() {
	if (!(await verifyAuth())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const devices = await prisma.device.findMany({
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(devices);
	} catch (error) {
		console.error("[API] GET /api/admin/devices error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch devices" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	if (!(await verifyAuth("/admin/devices"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = deviceSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid device data", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const device = await prisma.device.create({
			data: parsed.data,
		});

		return NextResponse.json(device, { status: 201 });
	} catch (error: unknown) {
		console.error("[API] POST /api/admin/devices error:", error);
		const message =
			error instanceof Error && error.message.includes("Unique constraint")
				? "A device with that Device ID or Serial Number already exists."
				: "Failed to create device";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
