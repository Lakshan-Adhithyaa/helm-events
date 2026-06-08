import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Speaker } from "@/lib/models/speaker";

export async function GET() {
  try {
    await connectToDatabase();
    const speakers = await Speaker.find().sort({ createdAt: -1 });

    return NextResponse.json(speakers, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch speakers.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const speaker = await Speaker.create(payload);

    return NextResponse.json(speaker, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create speaker.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
