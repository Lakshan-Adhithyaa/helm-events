import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/lib/models/incident";

export async function GET() {
  try {
    await connectToDatabase();
    const incidents = await Incident.find().sort({ createdAt: -1 });

    return NextResponse.json(incidents, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch incidents.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const incident = await Incident.create(payload);

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create incident.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
