import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Event } from "@/lib/models/event";

export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch events.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const event = await Event.create(payload);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create event.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
